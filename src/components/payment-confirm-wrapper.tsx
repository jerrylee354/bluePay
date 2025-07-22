
"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PaymentConfirm from '@/components/payment-confirm';
import { type Dictionary } from '@/dictionaries';

export default function PaymentConfirmWrapper({ dictionary }: { dictionary: Dictionary }) {
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [mode, setMode] = useState('pay');

    useEffect(() => {
        setUserId(searchParams.get('userId'));
        setMode(searchParams.get('mode') || 'pay');
    }, [searchParams]);

    return <PaymentConfirm userId={userId} mode={mode} dictionary={dictionary} />;
}
