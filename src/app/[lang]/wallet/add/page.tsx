
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { getDictionary, Dictionary } from '@/dictionaries';
import { type Locale, i18n } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ticket } from 'lucide-react';
import { getDoc, doc, DocumentData } from 'firebase/firestore';
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


export default function AddTicketPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addTicketToWallet, user, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();

    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ticketTemplate, setTicketTemplate] = useState<TicketTemplate | null>(null);

    const templateId = searchParams.get('templateId');
    const issuerId = searchParams.get('issuerId');

    useEffect(() => {
        const fetchDictionary = async () => {
            const lang = (searchParams.get('lang') as Locale) || i18n.defaultLocale;
            const dict = await getDictionary(lang);
            setDictionary(dict);
        };
        fetchDictionary();
    }, [searchParams]);

    useEffect(() => {
        if (!dictionary) return;
        
        if (!user && !isAuthLoading) {
            const loginUrl = `/${dictionary.locale}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            router.push(loginUrl);
            return;
        }

        const fetchTicketTemplate = async () => {
            if (!templateId || !issuerId) {
                setError("Invalid ticket link. Required information is missing.");
                setIsLoading(false);
                return;
            }

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

        if (user) {
           fetchTicketTemplate();
        }

    }, [user, isAuthLoading, templateId, issuerId, router, dictionary]);

    const handleAddTicket = async () => {
        if (!templateId || !issuerId || !dictionary) return;
        setIsProcessing(true);
        try {
            await addTicketToWallet(templateId, issuerId);
            toast({ title: dictionary.wallet.addTicketSuccess });
            router.push(`/${dictionary.locale}/wallet`);
        } catch (err: any) {
            setError(err.message || dictionary.wallet.addTicketError);
            setIsProcessing(false);
        }
    };
    
    const handleClose = () => {
        if(window.history.length > 1) {
            router.back();
        } else {
            router.push(`/${dictionary?.locale || 'en'}/wallet`);
        }
    }

    if (isLoading || isAuthLoading || !dictionary) {
        return <LoadingOverlay isLoading={true} />;
    }
    
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>{dictionary.wallet.addTicketError}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <AlertCircle className="h-16 w-16 text-destructive" />
                            <p>{error}</p>
                            <Button onClick={handleClose}>
                                Back to Wallet
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!ticketTemplate) {
        return <LoadingOverlay isLoading={true} />;
    }

    return (
         <div className="flex min-h-screen items-center justify-center p-4">
            <LoadingOverlay isLoading={isProcessing} />
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>{ticketTemplate.issuerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">wants to add a ticket to your wallet</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <TicketCardPreview template={ticketTemplate} />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleClose} className="w-full">Close</Button>
                        <Button onClick={handleAddTicket} className="w-full">Add to Wallet</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
