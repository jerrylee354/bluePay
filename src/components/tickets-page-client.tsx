

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Plus, Ticket as TicketIcon, ScanLine, Share2, Edit, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Copy, X } from 'lucide-react';
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
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { LoadingOverlay } from './ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';

const TicketTemplateCard = ({ template, onShare, onEdit, dictionary }: { template: TicketTemplate, onShare: () => void, onEdit: () => void, dictionary: Dictionary['tickets'] }) => {
    const isExpired = template.expiresAt && new Date(template.expiresAt) < new Date();
    
    return (
        <div 
            className="rounded-lg p-4 text-white shadow-md flex flex-col justify-between overflow-hidden relative"
            style={{ 
                backgroundColor: template.style?.backgroundColor || '#4f46e5',
                color: template.style?.textColor || '#ffffff',
            }}
        >
            {isExpired && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                    <p className="font-bold text-lg -rotate-12 transform">{dictionary.expired}</p>
                    <p className="text-xs opacity-80 mt-1">{dictionary.cannotBeShared}</p>
                </div>
            )}
            <div className="flex-1">
                <p className="text-sm opacity-80">{template.issuerName}</p>
                <h3 className="text-xl font-bold truncate">{template.title}</h3>
                <p className="text-sm opacity-90 mt-1 line-clamp-2">{template.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4 gap-2">
                <p className="text-xs opacity-70 flex-1">
                    {template.issuanceCount} / {template.issuanceLimit ?? '∞'} issued
                </p>
                 <Button size="icon" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white w-8 h-8" onClick={onEdit}>
                    <Edit className="h-4 w-4"/>
                </Button>
                <Button size="icon" variant="ghost" className="bg-white/20 hover:bg-white/30 text-white w-8 h-8" onClick={onShare} disabled={isExpired}>
                    <Share2 className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
};

const colorOptions = [
    { name: 'Indigo', bg: '#4f46e5', text: '#ffffff' },
    { name: 'Sky', bg: '#0ea5e9', text: '#ffffff' },
    { name: 'Emerald', bg: '#10b981', text: '#ffffff' },
    { name: 'Amber', bg: '#f59e0b', text: '#1f2937' },
    { name: 'Rose', bg: '#f43f5e', text: '#ffffff' },
    { name: 'Fuchsia', bg: '#d946ef', text: '#ffffff' },
    { name: 'Lime', bg: '#84cc16', text: '#1a2e05' },
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
    const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);

    const isEditing = !!existingTemplate;
    const totalSteps = 4;
    const dialogTitle = isEditing ? dictionary.editTicket : dictionary.createTicket;


    useEffect(() => {
        if (isOpen) {
            setStep(1);
            if (isEditing && existingTemplate) {
                setTitle(existingTemplate.title);
                setDescription(existingTemplate.description);
                setSelectedStyle(colorOptions.find(c => c.bg === existingTemplate.style.backgroundColor) || colorOptions[0]);
                setLimit(existingTemplate.issuanceLimit?.toString() ?? '');
                setExpiresAt(existingTemplate.expiresAt ? new Date(existingTemplate.expiresAt) : undefined);
            } else {
                setTitle('');
                setDescription('');
                setSelectedStyle(colorOptions[0]);
                setLimit('');
                setExpiresAt(undefined);
            }
        }
    }, [isOpen, isEditing, existingTemplate]);

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

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
                setIsProcessing(false);
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
                expiresAt: expiresAt ? expiresAt.toISOString() : null
            };

            if (isEditing && existingTemplate) {
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
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setExpiresAt(new Date(e.target.value));
        } else {
            setExpiresAt(undefined);
        }
    };

    const getDatetimeLocalValue = (date: Date | undefined) => {
        if (!date) return '';
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-4 w-full">
                        <Label htmlFor="ticketName">{dictionary.ticketName}</Label>
                        <Input id="ticketName" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={dictionary.ticketNamePlaceholder} className="text-base h-12" />
                        <Label htmlFor="ticketDesc">{dictionary.ticketDescription}</Label>
                        <Textarea id="ticketDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={dictionary.ticketDescriptionPlaceholder} className="text-base min-h-[100px]" />
                    </div>
                );
            case 2:
                return (
                    <div className="w-full">
                        <Label>{dictionary.style}</Label>
                        <div className="grid grid-cols-4 gap-4 mt-2">
                            {colorOptions.map(color => (
                                <button 
                                    key={color.name}
                                    className="flex flex-col items-center gap-2 group"
                                    onClick={() => setSelectedStyle(color)}
                                >
                                    <div
                                      className={cn("w-16 h-16 rounded-full border-4 transition-all", selectedStyle.bg === color.bg ? 'border-primary scale-110' : 'border-transparent group-hover:border-muted')}
                                      style={{ backgroundColor: color.bg }}
                                    />
                                    <span className="text-sm font-medium">{color.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                     <div className="w-full space-y-4">
                        <Label htmlFor="issuanceLimit">{dictionary.issuanceLimit}</Label>
                        <Input id="issuanceLimit" value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^0-9]/g, ''))} placeholder={dictionary.issuanceLimitPlaceholder} type="number" min="0" className="text-base h-12" />
                    </div>
                );
            case 4:
                 return (
                    <div className="w-full space-y-4">
                        <Label htmlFor="expirationDate">{dictionary.expirationDate}</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                             <Input
                                id="expirationDate"
                                type="datetime-local"
                                value={getDatetimeLocalValue(expiresAt)}
                                onChange={handleDateChange}
                                className="h-12 text-base pl-10"
                            />
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg flex flex-col sm:h-auto max-h-[90dvh]">
                <LoadingOverlay isLoading={isProcessing} />
                <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">{dialogTitle}</DialogTitle>
                         <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{dictionary.step} {step}/{totalSteps}</span>
                             <DialogClose asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <X className="h-5 w-5" />
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                    <DialogDescription className="sr-only">{dictionary.createTicketDescription}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between items-center p-6 pt-4 border-t flex-shrink-0">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={handleBack}><ChevronLeft className="mr-2 h-4 w-4"/> {dictionary.back}</Button>
                    ) : <div></div>}

                    {step < totalSteps ? (
                        <Button onClick={handleNext} disabled={!title}>{dictionary.next} <ChevronRight className="ml-2 h-4 w-4"/></Button>
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
    const { user, userData, ticketTemplates, isLoading, createTicketLink } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [shareableLink, setShareableLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);


    useEffect(() => {
        if (!isLoading && userData?.accountType !== 'business') {
          router.push('/home');
        }
    }, [userData, isLoading, router]);

    const handleShare = async (template: TicketTemplate) => {
        if (!user) return;
        setSelectedTemplate(template);
        setIsShareOpen(true);
        setIsGeneratingLink(true);
        setShareableLink('');

        try {
            const linkId = await createTicketLink(template.id);
            const baseUrl = window.location.origin;
            const lang = dictionary.locale;
            const addUrl = `${baseUrl}/${lang}/wallet/add?linkId=${linkId}`;
            setShareableLink(addUrl);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Failed to create link", description: error.message });
            setIsShareOpen(false);
        } finally {
            setIsGeneratingLink(false);
        }
    };
    
    const handleEdit = (template: TicketTemplate) => {
        setSelectedTemplate(template);
        setIsEditing(true);
        setIsCreateEditOpen(true);
    };
    
    const handleCreate = () => {
        setSelectedTemplate(null);
        setIsEditing(false);
        setIsCreateEditOpen(true);
    }
    
    const copyToClipboard = async () => {
        if (!shareableLink) return;
        try {
            await navigator.clipboard.writeText(shareableLink);
            toast({ title: d.linkCopied });
        } catch (error: any) {
             toast({ variant: 'destructive', title: d.copyFailed, description: error.message });
        }
    };

    if (isLoading || !userData || userData.accountType !== 'business') {
        return <LoadingOverlay isLoading={true} />;
    }

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
                        <TicketTemplateCard key={template.id} template={template} onShare={() => handleShare(template)} onEdit={() => handleEdit(template)} dictionary={d}/>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                    <TicketIcon className="w-16 h-16 text-muted-foreground" />
                    <p className="font-semibold text-lg">{d.noTemplatesTitle}</p>
                    <p className="text-sm text-muted-foreground">{d.noTemplatesDescription}</p>
                     <Button onClick={handleCreate}>
                        {d.createFirstTicket}
                    </Button>
                </div>
            )}
            
            <CreateEditTicketDialog 
                isOpen={isCreateEditOpen}
                setIsOpen={setIsCreateEditOpen}
                dictionary={d}
                existingTemplate={isEditing ? selectedTemplate : null}
            />

            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">{d.shareTicket}</DialogTitle>
                        <DialogDescription className="text-center">{d.shareThisQr}</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
                        {isGeneratingLink || !shareableLink ? (
                            <div className="w-64 h-64 bg-muted rounded-lg animate-pulse" />
                         ) : (
                            <QRCode value={shareableLink} size={256} />
                         )}
                        <Button onClick={copyToClipboard} variant="secondary" className="w-full" disabled={!shareableLink}>
                            <Copy className="mr-2 h-4 w-4" />
                            {d.copyLink}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
