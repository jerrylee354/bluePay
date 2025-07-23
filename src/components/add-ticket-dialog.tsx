
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAddTicketDialogStore } from '@/stores/add-ticket-dialog-store';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { Dictionary } from '@/dictionaries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ticket } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TicketTemplate } from '@/lib/data';

const TicketCardPreview = ({ template }: { template: TicketTemplate }) => {
    const cardStyle = {
        backgroundColor: template.style?.backgroundColor || '#4f46e5',
        color: template.style?.textColor || '#ffffff',
    };

    return (
        <div 
            className="rounded-lg p-4 text-white shadow-md flex flex-col h-full relative overflow-hidden"
            style={cardStyle}
        >
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm opacity-80">{template.issuerName}</p>
                        <h3 className="text-xl font-bold">{template.title}</h3>
                    </div>
                    <Ticket className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm opacity-90 mt-2 line-clamp-2">{template.description}</p>
            </div>
            {template.expiresAt && (
                 <div className="mt-4 pt-2 border-t border-white/20 text-xs opacity-80">
                     Expires: {new Date(template.expiresAt).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

export default function AddTicketDialog({ dictionary }: { dictionary: Dictionary }) {
    const { isOpen, templateId, issuerId, closeDialog } = useAddTicketDialogStore();
    const { addTicketToWallet } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ticketTemplate, setTicketTemplate] = useState<TicketTemplate | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when dialog is closed
            setTimeout(() => {
                setTicketTemplate(null);
                setError(null);
                setIsLoading(false);
            }, 300); // delay to allow for closing animation
            return;
        }

        const fetchTicketTemplate = async () => {
            if (!templateId || !issuerId) {
                setError("Invalid ticket link. Required information is missing.");
                return;
            }
            
            setIsLoading(true);
            setError(null);
            setTicketTemplate(null);
            
            try {
                const templateRef = doc(db, "users", issuerId, "ticketTemplates", templateId);
                const templateSnap = await getDoc(templateRef);

                if (templateSnap.exists()) {
                    setTicketTemplate({ id: templateSnap.id, ...templateSnap.data() } as TicketTemplate);
                } else {
                    setError("Ticket template not found.");
                }
            } catch (err) {
                setError("Failed to fetch ticket information.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTicketTemplate();
    }, [isOpen, templateId, issuerId]);

    const handleAddTicket = async () => {
        if (!templateId || !issuerId) return;
        setIsProcessing(true);
        try {
            await addTicketToWallet(templateId, issuerId);
            toast({ title: dictionary.wallet.addTicketSuccess });
            closeDialog();
        } catch (err: any) {
            setError(err.message || dictionary.wallet.addTicketError);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (!isProcessing) {
            closeDialog();
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <LoadingOverlay isLoading={isProcessing} />
                <DialogHeader>
                    <DialogTitle className="text-center">{dictionary.wallet.addTicketToWallet}</DialogTitle>
                    <DialogDescription className="text-center">
                        {ticketTemplate?.issuerName || '...'} wants to add a ticket to your wallet.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isLoading && <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />}

                    {error && !isLoading && (
                        <Card className="w-full text-center">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <AlertCircle className="h-12 w-12 text-destructive" />
                                    <p>{error}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && !error && ticketTemplate && (
                        <TicketCardPreview template={ticketTemplate} />
                    )}
                </div>

                <DialogFooter className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                        {dictionary.wallet.close}
                    </Button>
                    <Button onClick={handleAddTicket} disabled={isProcessing || isLoading || !!error}>
                        {dictionary.wallet.add}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
