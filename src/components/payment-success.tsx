

"use client";

import { Button } from "@/components/ui/button";
import { type Transaction } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dictionary } from "@/dictionaries";
import { OrderItem } from "./payment-confirm";
import VerifiedAvatar from "./VerifiedAvatar";

const AnimatedCheckmark = () => (
    <div className="mx-auto my-8 h-[100px] w-[100px] flex-shrink-0">
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
    </div>
);

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatDate(dateString: string, locale: string) {
    return new Date(dateString).toLocaleString(locale, {
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
        <p className="font-medium text-right break-all">{value}</p>
    </div>
);

const OrderItemsList = ({ items, currency, dictionary }: { items: OrderItem[], currency: string, dictionary: Dictionary['paymentConfirm'] }) => (
    <div className="mt-6 text-left bg-muted/50 p-3 rounded-md space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">{dictionary.orderSummary}</p>
        {items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
                <span>{item.name}</span>
                <span>{formatCurrency(parseFloat(item.price), currency)}</span>
            </div>
        ))}
    </div>
);


export default function PaymentSuccess({ transaction, dictionary }: { transaction: Transaction, dictionary: Dictionary }) {
    const { userData, clearPaymentSuccessState } = useAuth();
    const currency = userData?.currency || 'USD';
    const d_success = dictionary.paymentSuccess;
    const d_confirm = dictionary.paymentConfirm;

    const isRequest = transaction.status === dictionary.status.Requested;
    const titleText = isRequest ? d_success.requestSent : d_success.paymentSuccessful;

    return (
        <div className="flex flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8 min-h-dvh">
            <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row md:gap-8 lg:gap-12">
                <div className="flex flex-col items-center justify-center text-center md:w-1/2 flex-shrink-0">
                    <Card className="w-full shadow-none border-0 md:shadow-lg md:border">
                        <CardContent className="p-6 md:p-8">
                            <AnimatedCheckmark />
                            <div className="space-y-2 mb-6">
                                <h1 className="text-3xl font-bold">{titleText}</h1>
                                <div className="text-5xl font-bold text-primary">
                                    {formatCurrency(transaction.amount, currency)}
                                </div>
                            </div>
                            <div className="w-full mt-6">
                                <Button onClick={clearPaymentSuccessState} className="w-full h-12 text-lg">{d_success.done}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="md:w-1/2 flex flex-col mt-8 md:mt-0">
                    <Card className="w-full shadow-none border-0 md:shadow-lg md:border flex-grow">
                        <CardContent className="p-6 md:p-8 h-full flex flex-col">
                             <div className="flex flex-col items-center space-y-2 mb-6">
                                <VerifiedAvatar user={transaction.otherParty} className="h-12 w-12" />
                                <div>
                                    <p className="text-muted-foreground text-sm">{isRequest ? d_success.requestedFrom : d_success.paidTo}</p>
                                    <p className="font-semibold text-lg">{transaction.name}</p>
                                </div>
                            </div>

                            <Separator className="my-4 md:my-6" />

                            <div className="space-y-1 text-left flex-grow">
                                <DetailRow label={d_success.transactionDate} value={formatDate(transaction.date, dictionary.locale)} />
                                <DetailRow label={d_success.transactionStatus} value={dictionary.status[transaction.status as keyof typeof dictionary.status] || transaction.status} />
                                 <DetailRow label={d_success.transactionId} value={<span className="font-mono text-xs">{transaction.id}</span>} />
                            </div>
                            
                            {transaction.orderItems && transaction.orderItems.length > 0 && (
                                <OrderItemsList items={transaction.orderItems} currency={currency} dictionary={d_confirm} />
                            )}

                            {transaction.description && (
                                <div className="mt-6 text-left bg-muted/50 p-3 rounded-md">
                                    <p className="text-sm text-muted-foreground">{d_success.note}:</p>
                                    <p className="text-sm break-words">{transaction.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
