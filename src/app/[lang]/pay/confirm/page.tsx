
import { Suspense } from 'react';
import PaymentConfirmWrapper from '@/components/payment-confirm-wrapper';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function ConfirmPaymentPage({ params }: { params: { lang: Locale } }) {
    const dictionary = await getDictionary(params.lang);

    return (
        <Suspense fallback={<LoadingOverlay isLoading={true} />} >
            <PaymentConfirmWrapper dictionary={dictionary} />
        </Suspense>
    );
}
