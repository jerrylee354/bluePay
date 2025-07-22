
"use client";

import { Button } from "@/components/ui/button";
import { type Transaction } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dictionary } from "@/dictionaries";


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

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const DetailRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm py-3">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);


export default function PaymentSuccess({ transaction, onFinish, dictionary }: { transaction: Transaction, onFinish: () => void, dictionary: Dictionary }) {
    const { userData } = useAuth();
    const currency = userData?.currency || 'USD';

    const titleText = transaction.type === 'payment' ? 'Payment Successful' : 'Request Sent';
    
    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    }

    return (
        <>
            <style jsx>{`
                .checkmark {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #3880ff; /* --primary-color */
                    stroke-miterlimit: 10;
                    margin: 2rem auto;
                    box-shadow: inset 0px 0px 0px #3880ff;
                    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }
                .checkmark__circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: #3880ff;
                    fill: none;
                    animation: stroke .6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .checkmark__check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    stroke: #ffffff; /* --primary-foreground-color */
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
                    100% { box-shadow: inset 0px 0px 0px 50px #3880ff; }
                }
            `}</style>
            <div className="flex flex-col h-full bg-background items-center justify-center text-center p-4 sm:p-8">
                <Card className="w-full max-w-md animate-fade-in-up">
                    <CardContent className="p-6 md:p-8">
                        <AnimatedCheckmark />
                        <div className="space-y-2 mb-6">
                            <h1 className="text-3xl font-bold">{titleText}</h1>
                            <div className="text-5xl font-bold text-primary">
                                {formatCurrency(transaction.amount, currency)}
                            </div>
                        </div>

                         <div className="flex flex-col items-center space-y-2 mb-6">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={transaction.otherParty?.photoURL} alt={transaction.name} />
                                <AvatarFallback>{getInitials(transaction.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-muted-foreground text-sm">{transaction.type === 'payment' ? 'Paid to' : 'Requested from'}</p>
                                <p className="font-semibold text-lg">{transaction.name}</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-1 text-left">
                            <DetailRow label="Transaction Date" value={formatDate(transaction.date)} />
                            <DetailRow label="Transaction Status" value={transaction.status} />
                             <DetailRow label="Transaction ID" value={<span className="font-mono text-xs">{transaction.id}</span>} />
                        </div>
                        
                        {transaction.description && (
                            <div className="mt-6 text-left bg-muted/50 p-3 rounded-md">
                                <p className="text-sm text-muted-foreground">Note:</p>
                                <p className="text-sm">{transaction.description}</p>
                            </div>
                        )}
                        
                    </CardContent>
                </Card>
                <div className="w-full max-w-md mt-6">
                    <Button onClick={onFinish} className="w-full h-12 text-lg">Done</Button>
                </div>
            </div>
        </>
    );
}
