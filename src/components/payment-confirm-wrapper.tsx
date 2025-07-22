
"use client";

import { useSearchParams } from 'next/navigation';
import PaymentConfirm from '@/components/payment-confirm';
import { type Dictionary } from '@/dictionaries';

export default function PaymentConfirmWrapper({ dictionary }: { dictionary: Dictionary }) {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') || 'pay';

    return <PaymentConfirm userId={userId} mode={mode} dictionary={dictionary} />;
}
