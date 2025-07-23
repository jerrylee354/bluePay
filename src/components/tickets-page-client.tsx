
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Plus, Ticket, ScanLine, Share2 } from 'lucide-react';
import { Dictionary } from '@/dictionaries';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { TicketTemplate } from '@/lib/data';
import QRCode from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { LoadingOverlay } from './ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TicketTemplateCard = ({ template, onShare }: { template: TicketTemplate, onShare: () => void }) => (
    <div 
        className="rounded-lg p-4 text-white shadow-md flex flex-col justify-between"
        style={{ 
            backgroundColor: template.style?.backgroundColor || '#4f46e5',
            color: template.style?.textColor || '#ffffff',
        }}
    >
        <div>
            <p className="text-sm opacity-80">{template.issuerName}</p>
            <h3 className="text-xl font-bold">{template.title}</h3>
        </div>
        <div className="flex justify-end mt-4">
            <Button size="sm" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white" onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4"/>
                Share
            </Button>
        </div>
    </div>
);

const colorOptions = [
    { name: 'Indigo', bg: '#4f46e5', text: '#ffffff' },
    { name: 'Sky', bg: '#0ea5e9', text: '#ffffff' },
    { name: 'Emerald', bg: '#10b981', text: '#ffffff' },
    { name: 'Amber', bg: '#f59e0b', text: '#1f2937' },
    { name: 'Rose', bg: '#f43f5e', text: '#ffffff' },
    { name: 'Slate', bg: '#475569', text: '#ffffff' },
];

export default function TicketsPageClient({ dictionary }: { dictionary: Dictionary}) {
    const d = dictionary.tickets;
    const { user, userData, ticketTemplates, createTicketTemplate, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [newTicketName, setNewTicketName] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(colorOptions[0]);
    const [createdTemplate, setCreatedTemplate] = useState<TicketTemplate | null>(null);

    const handleCreateTicket = async () => {
        if (!newTicketName) return;
        
        setIsProcessing(true);
        try {
            await createTicketTemplate({
                title: newTicketName,
                style: {
                    backgroundColor: selectedStyle.bg,
                    textColor: selectedStyle.text
                }
            });
            
            // The new template will be added to the list by the onSnapshot listener
            // We need a way to get the created template's ID to show the QR code.
            // For now, let's close this and assume the user can find it.
            toast({ title: d.ticketCreated });
            setIsCreateDialogOpen(false);
            setNewTicketName('');

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Creation Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleShare = (template: TicketTemplate) => {
        setCreatedTemplate(template);
        setIsShareDialogOpen(true);
    };

    const qrValue = createdTemplate && `{"type":"ticket_add","templateId":"${createdTemplate.id}","issuerId":"${createdTemplate.issuerId}"}`;

    return (
        <div className="space-y-6">
            <LoadingOverlay isLoading={isProcessing} />
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{d.title}</h1>
                <div className="flex gap-2">
                     <Button variant="outline" size="icon" onClick={() => router.push('/tickets/scan')}>
                        <ScanLine className="h-5 w-5"/>
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Plus className="h-5 w-5"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{d.createTicket}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="ticketName" className="text-sm font-medium text-muted-foreground">{d.ticketName}</label>
                                    <Input id="ticketName" value={newTicketName} onChange={(e) => setNewTicketName(e.target.value)} placeholder={d.ticketNamePlaceholder} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">{d.style}</label>
                                    <div className="flex gap-2 mt-2">
                                        {colorOptions.map(color => (
                                            <button 
                                                key={color.name}
                                                className={`w-8 h-8 rounded-full border-2 ${selectedStyle.bg === color.bg ? 'border-primary' : 'border-transparent'}`}
                                                style={{ backgroundColor: color.bg }}
                                                onClick={() => setSelectedStyle(color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handleCreateTicket} className="w-full" disabled={isProcessing || !newTicketName}>{d.publish}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {isLoading ? (
                <p>Loading...</p>
            ) : ticketTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticketTemplates.map(template => (
                        <TicketTemplateCard key={template.id} template={template} onShare={() => handleShare(template)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                    <Ticket className="w-16 h-16 text-muted-foreground" />
                    <p className="font-semibold text-lg">{d.noTemplatesTitle}</p>
                    <p className="text-sm text-muted-foreground">{d.noTemplatesDescription}</p>
                     <Button onClick={() => setIsCreateDialogOpen(true)}>
                        {d.createFirstTicket}
                    </Button>
                </div>
            )}
            
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">{d.ticketCreated}</DialogTitle>
                        <DialogDescription className="text-center">{d.shareThisQr}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        {qrValue && <QRCode value={qrValue} size={256} />}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
