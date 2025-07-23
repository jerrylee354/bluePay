
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Plus, Ticket, ScanLine, Share2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Textarea } from './ui/textarea';
import { LoadingOverlay } from './ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

const TicketTemplateCard = ({ template, onShare, onEdit }: { template: TicketTemplate, onShare: () => void, onEdit: () => void }) => (
    <div 
        className="rounded-lg p-4 text-white shadow-md flex flex-col justify-between"
        style={{ 
            backgroundColor: template.style?.backgroundColor || '#4f46e5',
            color: template.style?.textColor || '#ffffff',
        }}
    >
        <div className="flex-1">
            <p className="text-sm opacity-80">{template.issuerName}</p>
            <h3 className="text-xl font-bold truncate">{template.title}</h3>
            <p className="text-sm opacity-90 mt-1 line-clamp-2">{template.description}</p>
        </div>
        <div className="flex justify-end items-center mt-4 gap-2">
            <p className="text-xs opacity-70 flex-1">
                {template.issuanceCount} / {template.issuanceLimit ?? '∞'} issued
            </p>
             <Button size="icon" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white w-8 h-8" onClick={onEdit}>
                <Edit className="h-4 w-4"/>
            </Button>
            <Button size="icon" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white w-8 h-8" onClick={onShare}>
                <Share2 className="h-4 w-4"/>
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

const CreateEditTicketDialog = ({
    isOpen,
    setIsOpen,
    dictionary,
    existingTemplate,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    dictionary: Dictionary['tickets'];
    existingTemplate?: TicketTemplate | null;
}) => {
    const { createTicketTemplate, updateTicketTemplate } = useAuth();
    const { toast } = useToast();
    
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(colorOptions[0]);
    const [limit, setLimit] = useState('');

    const isEditing = !!existingTemplate;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setTitle(existingTemplate.title);
                setDescription(existingTemplate.description);
                setSelectedStyle(colorOptions.find(c => c.bg === existingTemplate.style.backgroundColor) || colorOptions[0]);
                setLimit(existingTemplate.issuanceLimit?.toString() ?? '');
            } else {
                // Reset form for creation
                setStep(1);
                setTitle('');
                setDescription('');
                setSelectedStyle(colorOptions[0]);
                setLimit('');
            }
        }
    }, [isOpen, isEditing, existingTemplate]);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!title) {
            toast({ variant: 'destructive', title: "Title is required" });
            return;
        }
        setIsProcessing(true);
        try {
            const issuanceLimit = limit === '' ? null : parseInt(limit, 10);
            if (limit !== '' && (isNaN(issuanceLimit) || issuanceLimit < 0)) {
                toast({ variant: 'destructive', title: "Invalid issuance limit" });
                return;
            }

            const templateData = {
                title,
                description,
                style: {
                    backgroundColor: selectedStyle.bg,
                    textColor: selectedStyle.text
                },
                issuanceLimit,
            };

            if (isEditing) {
                await updateTicketTemplate(existingTemplate.id, templateData);
                toast({ title: dictionary.ticketUpdated });
            } else {
                await createTicketTemplate(templateData);
                toast({ title: dictionary.ticketCreated });
            }
            
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: isEditing ? "Update Failed" : "Creation Failed", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <DialogTitle>{isEditing ? dictionary.editTicket : dictionary.createTicket} - {dictionary.step1}</DialogTitle>
                        <div>
                            <Label htmlFor="ticketName">{dictionary.ticketName}</Label>
                            <Input id="ticketName" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={dictionary.ticketNamePlaceholder} />
                        </div>
                        <div>
                             <Label htmlFor="ticketDesc">{dictionary.ticketDescription}</Label>
                            <Textarea id="ticketDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={dictionary.ticketDescriptionPlaceholder} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <DialogTitle>{isEditing ? dictionary.editTicket : dictionary.createTicket} - {dictionary.step2}</DialogTitle>
                        <Label>{dictionary.style}</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {colorOptions.map(color => (
                                <button 
                                    key={color.name}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedStyle.bg === color.bg ? 'border-primary scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color.bg }}
                                    onClick={() => setSelectedStyle(color)}
                                />
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <DialogTitle>{isEditing ? dictionary.editTicket : dictionary.createTicket} - {dictionary.step3}</DialogTitle>
                        <Label htmlFor="issuanceLimit">{dictionary.issuanceLimit}</Label>
                        <Input id="issuanceLimit" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ''))} placeholder={dictionary.issuanceLimitPlaceholder} type="number" min="0" />
                    </div>
                );
            default: return null;
        }
    };
    
    const totalSteps = 3;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <LoadingOverlay isLoading={isProcessing} />
                <DialogHeader className="pr-10">
                    <DialogDescription>{dictionary.createTicketDescription}</DialogDescription>
                </DialogHeader>
                <div className="min-h-[200px] flex items-center">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between items-center pt-4">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={handleBack}><ChevronLeft className="mr-2 h-4 w-4"/> {dictionary.back}</Button>
                    ) : <div></div>}

                    {step < totalSteps ? (
                        <Button onClick={handleNext}>{dictionary.next} <ChevronRight className="ml-2 h-4 w-4"/></Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isProcessing || !title}>{isEditing ? dictionary.saveChanges : dictionary.publish}</Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function TicketsPageClient({ dictionary }: { dictionary: Dictionary}) {
    const d = dictionary.tickets;
    const { ticketTemplates, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'share' | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);

    const handleShare = (template: TicketTemplate) => {
        setSelectedTemplate(template);
        setDialogMode('share');
        setIsMainDialogOpen(true);
    };

    const handleEdit = (template: TicketTemplate) => {
        setSelectedTemplate(template);
        setDialogMode('edit');
        setIsMainDialogOpen(true);
    };
    
    const handleCreate = () => {
        setSelectedTemplate(null);
        setDialogMode('create');
        setIsMainDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setIsMainDialogOpen(false);
        setDialogMode(null);
        setSelectedTemplate(null);
    }

    const qrValue = selectedTemplate ? `{"type":"ticket_add","templateId":"${selectedTemplate.id}","issuerId":"${selectedTemplate.issuerId}"}` : '';
    
    const copyToClipboard = () => {
        if (!qrValue) return;
        navigator.clipboard.writeText(qrValue).then(() => {
            toast({ title: d.linkCopied });
        }, (err) => {
            toast({ variant: 'destructive', title: d.copyFailed, description: err.message });
        });
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{d.title}</h1>
                <div className="flex gap-2">
                     <Button variant="outline" size="icon" onClick={() => router.push('/tickets/scan')}>
                        <ScanLine className="h-5 w-5"/>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleCreate}>
                        <Plus className="h-5 w-5"/>
                    </Button>
                </div>
            </header>

            {isLoading ? (
                <p>Loading...</p>
            ) : ticketTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticketTemplates.map(template => (
                        <TicketTemplateCard key={template.id} template={template} onShare={() => handleShare(template)} onEdit={() => handleEdit(template)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                    <Ticket className="w-16 h-16 text-muted-foreground" />
                    <p className="font-semibold text-lg">{d.noTemplatesTitle}</p>
                    <p className="text-sm text-muted-foreground">{d.noTemplatesDescription}</p>
                     <Button onClick={handleCreate}>
                        {d.createFirstTicket}
                    </Button>
                </div>
            )}
            
            <CreateEditTicketDialog 
                isOpen={dialogMode === 'create' || dialogMode === 'edit'}
                setIsOpen={handleDialogClose}
                dictionary={d}
                existingTemplate={dialogMode === 'edit' ? selectedTemplate : null}
            />

            <Dialog open={dialogMode === 'share'} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">{d.shareTicket}</DialogTitle>
                        <DialogDescription className="text-center">{d.shareThisQr}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
                        {qrValue && <QRCode value={qrValue} size={256} />}
                        <Button onClick={copyToClipboard} variant="secondary" className="w-full">{d.copyLink}</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
