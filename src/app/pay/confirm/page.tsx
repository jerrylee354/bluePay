
"use client";

import { useSearchParams } from 'next/navigation';
import PaymentConfirm from '@/components/payment-confirm';

export default function ConfirmPaymentPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') || 'pay';

    return <PaymentConfirm userId={userId} mode={mode} />;
}
