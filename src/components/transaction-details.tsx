
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { type Transaction } from "@/lib/data";
import { DocumentData } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);

export default function TransactionDetails({ transaction }: { transaction: Transaction }) {
    const { getUserById, userData } = useAuth();
    const [otherParty, setOtherParty] = useState<DocumentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!transaction.otherPartyUid) {
            setIsLoading(false);
            return;
        }
        const fetchOtherParty = async () => {
            setIsLoading(true);
            try {
                const user = await getUserById(transaction.otherPartyUid);
                setOtherParty(user);
            } catch (error) {
                console.error("Failed to fetch other party", error);
                setOtherParty(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOtherParty();
    }, [transaction.otherPartyUid, getUserById]);
    
    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    }
    
    const currency = userData?.currency || 'USD';
    const displayName = otherParty ? `${otherParty.firstName} ${otherParty.lastName}` : transaction.name;

    return (
        <div className="p-2 space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
                {isLoading ? (
                    <>
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                    </>
                ) : (
                    <>
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={otherParty?.photoURL} alt={displayName} />
                            <AvatarFallback className="text-2xl">{getInitials(otherParty?.firstName || transaction.name)}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-lg">{displayName}</p>
                    </>
                )}

                <div className="text-4xl font-bold flex items-center">
                   {transaction.type === 'payment' ? '-' : '+'}
                   {formatCurrency(transaction.amount, currency)}
                </div>
                 <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{transaction.status}</span>
                </div>
            </div>

            {transaction.description && (
                <div className="text-center bg-muted/50 p-4 rounded-lg">
                    <p>{transaction.description}</p>
                </div>
            )}
            
            {transaction.attachmentUrl && (
                <div className="flex justify-center">
                    <img src={transaction.attachmentUrl} alt="Transaction attachment" className="max-h-60 rounded-lg shadow-md" />
                </div>
            )}

            <Separator />
            
            <div className="space-y-3">
                 <DetailRow 
                    label="Transaction Type" 
                    value={
                        <span className="inline-flex items-center gap-1.5">
                            {transaction.type === 'payment' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            {transaction.type === 'payment' ? 'Payment Sent' : 'Payment Received'}
                        </span>
                    } 
                />
                <DetailRow label="Date" value={formatDate(transaction.date)} />
                <DetailRow label="Transaction ID" value={<span className="font-mono text-xs">{transaction.id}</span>} />
            </div>

        </div>
    )
}
