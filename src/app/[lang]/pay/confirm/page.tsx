

import { Suspense } from 'react';
import PaymentConfirm from '@/components/payment-confirm';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

// This page now acts as a Server Component to correctly handle search params
// and pass them down to the client component.
export default async function ConfirmPaymentPage({
    params,
    searchParams,
}: {
    params: { lang: Locale };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const dictionary = await getDictionary(params.lang);
    const userId = typeof searchParams.userId === 'string' ? searchParams.userId : null;
    const mode = typeof searchParams.mode === 'string' ? searchParams.mode : 'pay';

    return (
        <Suspense fallback={<LoadingOverlay isLoading={true} />}>
            <PaymentConfirm 
                dictionary={dictionary} 
                userIdFromProps={userId}
                modeFromProps={mode}
            />
        </Suspense>
    );
}
