
"use client";

import { Button } from "@/components/ui/button";
import { type Transaction } from "@/lib/data";
import { useAuth } from "@/context/auth-context";

const AnimatedCheckmark = () => (
    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
    </svg>
);

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export default function PaymentSuccess({ transaction, onFinish }: { transaction: Transaction, onFinish: () => void }) {
    const { userData } = useAuth();
    const currency = userData?.currency || 'USD';

    const titleText = transaction.type === 'payment' ? '付款成功' : '要求已傳送';
    const descriptionText = transaction.type === 'payment' 
        ? `您已成功付款 ${formatCurrency(transaction.amount, currency)} 給 ${transaction.name}.`
        : `您已成功向 ${transaction.name} 要求 ${formatCurrency(transaction.amount, currency)}.`;
    
    return (
        <>
            <style jsx>{`
                .checkmark {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: hsl(var(--primary));
                    stroke-miterlimit: 10;
                    margin: 2rem auto;
                    box-shadow: inset 0px 0px 0px hsl(var(--primary));
                    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }
                .checkmark__circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: hsl(var(--primary));
                    fill: none;
                    animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .checkmark__check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    stroke: hsl(var(--primary-foreground));
                    animation: stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
                }
                @keyframes stroke {
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes scale {
                    0%, 100% { transform: none; }
                    50% { transform: scale3d(1.1, 1.1, 1); }
                }
                @keyframes fill {
                    100% { box-shadow: inset 0px 0px 0px 50px hsl(var(--primary)); }
                }
            `}</style>
            <div className="flex flex-col h-full bg-background items-center justify-center text-center p-8">
                <AnimatedCheckmark />
                <div className="space-y-2 mb-8">
                    <h1 className="text-3xl font-bold">{titleText}</h1>
                    <p className="text-muted-foreground text-lg">{descriptionText}</p>
                </div>
                <Button onClick={onFinish} className="w-full max-w-xs h-12 text-lg">完成</Button>
            </div>
        </>
    );
}
