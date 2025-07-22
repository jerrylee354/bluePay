
import { Suspense } from 'react';
import PaymentConfirm from '@/components/payment-confirm';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function ConfirmPaymentPage({ params }: { params: { lang: Locale } }) {
    const dictionary = await getDictionary(params.lang);

    return (
        <Suspense fallback={<LoadingOverlay isLoading={true} />} >
            <PaymentConfirm dictionary={dictionary} />
        </Suspense>
    );
}
