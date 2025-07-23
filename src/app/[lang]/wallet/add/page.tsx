
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AddTicketPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addTicketToWallet, user, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();

    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDictionary = async () => {
            const lang = (searchParams.get('lang') as Locale) || i18n.defaultLocale;
            const dict = await getDictionary(lang);
            setDictionary(dict);
        };
        fetchDictionary();
    }, [searchParams]);

    useEffect(() => {
        if (isAuthLoading || !dictionary) return;
        
        const templateId = searchParams.get('templateId');
        const issuerId = searchParams.get('issuerId');
        
        const d_wallet = dictionary.wallet;

        if (!user) {
            // User not logged in, redirect to login then come back
            const loginUrl = `/${dictionary.locale}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            router.push(loginUrl);
            return;
        }

        if (templateId && issuerId) {
            addTicketToWallet(templateId, issuerId)
                .then(() => {
                    toast({ title: d_wallet.addTicketSuccess });
                    router.push(`/${dictionary.locale}/wallet`);
                })
                .catch((err) => {
                    setError(err.message || d_wallet.addTicketError);
                    setIsLoading(false);
                });
        } else {
            setError("Invalid ticket link. Required information is missing.");
            setIsLoading(false);
        }
    }, [searchParams, addTicketToWallet, user, router, toast, dictionary, isAuthLoading]);

    if (isLoading || !dictionary) {
        return <LoadingOverlay isLoading={true} />;
    }

    const d = dictionary.wallet;

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>{d.addTicketError}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <AlertCircle className="h-16 w-16 text-destructive" />
                        <p>{error}</p>
                        <Button onClick={() => router.push(`/${dictionary.locale}/wallet`)}>
                            Back to Wallet
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    