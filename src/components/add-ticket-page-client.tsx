
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { Dictionary } from '@/dictionaries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ticket, X } from 'lucide-react';
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
            className="rounded-lg p-6 text-white shadow-lg flex flex-col h-full relative overflow-hidden w-full max-w-sm"
            style={cardStyle}
        >
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm opacity-80">{template.issuerName}</p>
                        <h3 className="text-2xl font-bold">{template.title}</h3>
                    </div>
                    <Ticket className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-base opacity-90 mt-4 line-clamp-3">{template.description}</p>
            </div>
            {template.expiresAt && (
                 <div className="mt-6 pt-3 border-t border-white/20 text-sm opacity-80">
                     Expires: {new Date(template.expiresAt).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

interface AddTicketPageClientProps {
    dictionary: Dictionary;
    templateId: string | null;
    issuerId: string | null;
}

export default function AddTicketPageClient({ dictionary, templateId, issuerId }: AddTicketPageClientProps) {
    const router = useRouter();
    const { user, addTicketToWallet, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ticketTemplate, setTicketTemplate] = useState<TicketTemplate | null>(null);

    useEffect(() => {
      if (!isAuthLoading && !user) {
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        router.push(`/${dictionary.locale}/login`);
      }
    }, [isAuthLoading, user, router, dictionary.locale]);

    useEffect(() => {
        if (!user) return; // Wait for user to be available

        const fetchTicketTemplate = async () => {
            if (!templateId || !issuerId) {
                setError("Invalid ticket link. Required information is missing.");
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);
            setTicketTemplate(null);
            
            try {
                const templateRef = doc(db, "users", issuerId, "ticketTemplates", templateId);
                const templateSnap = await getDoc(templateRef);

                if (templateSnap.exists()) {
                    const template = { id: templateSnap.id, ...templateSnap.data() } as TicketTemplate;
                    if (template.expiresAt && new Date(template.expiresAt) < new Date()) {
                        setError("This ticket offer has expired and can no longer be added.");
                    } else if (template.issuanceLimit !== null && template.issuanceCount >= template.issuanceLimit) {
                        setError("This ticket has reached its issuance limit and can no longer be added.");
                    } else {
                        setTicketTemplate(template);
                    }
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
    }, [templateId, issuerId, user]);

    const handleAddTicket = async () => {
        if (!templateId || !issuerId) return;
        setIsProcessing(true);
        try {
            await addTicketToWallet(templateId, issuerId);
            toast({ title: dictionary.wallet.addTicketSuccess });
            router.push(`/${dictionary.locale}/wallet`);
        } catch (err: any) {
            setError(err.message || dictionary.wallet.addTicketError);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        router.back();
    };

    if (isAuthLoading || (!ticketTemplate && !error && isLoading)) {
      return <LoadingOverlay isLoading={true} />;
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-dvh bg-secondary p-4">
            <LoadingOverlay isLoading={isProcessing} />
            <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95">
                <CardContent className="p-6 text-center space-y-6">
                    {isLoading && <div className="h-60 w-full animate-pulse rounded-lg bg-muted" />}

                    {error && !isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <AlertCircle className="h-16 w-16 text-destructive" />
                            <h2 className="text-xl font-bold">Unable to Add Ticket</h2>
                            <p className="text-muted-foreground">{error}</p>
                            <Button onClick={handleClose} className="w-full">
                                {dictionary.wallet.close}
                            </Button>
                        </div>
                    )}
                    
                    {!isLoading && !error && ticketTemplate && (
                        <div className="flex flex-col items-center justify-center space-y-6">
                             <h1 className="text-2xl font-bold">Add Ticket to Wallet</h1>
                             <p className="text-muted-foreground">
                                <span className="font-semibold">{ticketTemplate.issuerName}</span> wants to add a ticket to your wallet.
                             </p>

                            <TicketCardPreview template={ticketTemplate} />
                            
                             <div className="w-full grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                                    {dictionary.wallet.close}
                                </Button>
                                <Button onClick={handleAddTicket} disabled={isProcessing || isLoading || !!error}>
                                    {dictionary.wallet.add}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
