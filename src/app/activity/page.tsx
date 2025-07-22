
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TransactionDetails from '@/components/transaction-details';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Dictionary } from '@/dictionaries';


function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatDateHeader(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
    });
}

const statusStyles: { [key: string]: string } = {
    "Completed": "bg-green-100 text-green-700 hover:bg-green-100",
    "已完成": "bg-green-100 text-green-700 hover:bg-green-100",
    "Failed": "bg-red-100 text-red-700 hover:bg-red-100",
    "失敗": "bg-red-100 text-red-700 hover:bg-red-100",
    "Pending": "bg-gray-100 text-gray-700 hover:bg-gray-100",
    "待處理": "bg-gray-100 text-gray-700 hover:bg-gray-100",
    "Requested": "bg-gray-100 text-gray-700 hover:bg-gray-100",
    "已請求": "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

const TransactionItem = ({ tx, currency, onClick, onAvatarClick, onConfirmPayment, dictionary }: { tx: Transaction, currency: string, onClick: () => void, onAvatarClick: (e: React.MouseEvent) => void, onConfirmPayment: (tx: Transaction) => void, dictionary: Dictionary['activity'] }) => {
    
    const getInitials = (name?: string) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    }
    
    const statusStyle = statusStyles[tx.status] || statusStyles['Pending'];

    const isPaymentRequest = tx.status === dictionary.status.requested && tx.type === 'payment';

    return (
        <li className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-muted/50" onClick={isPaymentRequest ? undefined : onClick}>
            <Avatar className="h-11 w-11 cursor-default" onClick={onAvatarClick}>
                <AvatarImage src={tx.otherParty?.photoURL} alt={tx.name} />
                <AvatarFallback>{getInitials(tx.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <p className="font-semibold">{tx.name}</p>
                 {isPaymentRequest ? (
                    <Button size="sm" className="h-8" onClick={() => onConfirmPayment(tx)}>
                        {dictionary.confirmPayment}
                    </Button>
                 ) : (
                    <Badge variant="outline" className={cn("border-none", statusStyle)}>
                        {tx.status}
                    </Badge>
                 )}
            </div>
            <p className={cn("font-bold text-lg", tx.type === 'payment' ? 'text-foreground' : 'text-accent')}>
                {tx.type === 'payment' ? '- ' : '+ '}
                {formatCurrency(tx.amount, currency)}
            </p>
        </li>
    );
};

const TransactionList = ({ transactions, currency, onTransactionClick, onConfirmPayment, dictionary }: { transactions: Transaction[], currency: string, onTransactionClick: (tx: Transaction) => void, onConfirmPayment: (tx: Transaction) => void, dictionary: Dictionary['activity'] }) => {
    
    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    if (transactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                {dictionary.noTransactions}
            </div>
        );
    }
    
    const groupedTransactions = useMemo(() => {
        if (transactions.length === 0) return {};

        return transactions.reduce((acc, tx) => {
            const date = new Date(tx.date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(tx);
            return acc;
        }, {} as Record<string, Transaction[]>);
    }, [transactions]);


    return (
        <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([date, txs]) => (
                <div key={date}>
                    <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                        {formatDateHeader(date)}
                    </h3>
                    <ul className="divide-y">
                        {txs.map((tx) => (
                            <TransactionItem 
                                key={tx.id} 
                                tx={tx} 
                                currency={currency} 
                                onClick={() => onTransactionClick(tx)} 
                                onConfirmPayment={onConfirmPayment}
                                onAvatarClick={(e) => handleAvatarClick(e)}
                                dictionary={dictionary}
                            />
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default function ActivityPage({ dictionary }: { dictionary: Dictionary }) {
  const { transactions, userData, getUserById, user, processTransaction, declineTransaction } = useAuth();
  const currency = userData?.currency || 'USD';
  const { toast } = useToast();
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [transactionsWithDetails, setTransactionsWithDetails] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txToConfirm, setTxToConfirm] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
        setIsLoading(true);
        if (transactions.length === 0) {
            setTransactionsWithDetails([]);
            setIsLoading(false);
            return;
        }

        const detailedTxs = await Promise.all(
            transactions.map(async (tx) => {
                if (tx.otherPartyUid) {
                    const otherParty = await getUserById(tx.otherPartyUid);
                    return { ...tx, otherParty };
                }
                return tx;
            })
        );
        setTransactionsWithDetails(detailedTxs);
        setIsLoading(false);
    };

    if(transactions.length > 0) {
        fetchTransactionDetails();
    } else {
        setIsLoading(false);
        setTransactionsWithDetails([]);
    }
  }, [transactions, getUserById]);

  const payments = transactionsWithDetails.filter(tx => tx.type === 'payment');
  const receipts = transactionsWithDetails.filter(tx => tx.type === 'receipt');

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  }

  const handleDialogClose = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTx(null), 300);
  }
  
  const handleConfirmPayment = (tx: Transaction) => {
    setTxToConfirm(tx);
  };
  
  const executePaymentConfirmation = async () => {
    if (!txToConfirm || !user || !userData) return;
    
    if (txToConfirm.amount > userData.balance) {
        toast({
            variant: "destructive",
            title: dictionary.activity.insufficientFundsTitle,
            description: dictionary.activity.insufficientFundsDescription,
        });
        setTxToConfirm(null);
        return;
    }

    setIsConfirming(true);
    try {
        await processTransaction({
            fromUserId: user.uid,
            toUserId: txToConfirm.otherPartyUid,
            amount: txToConfirm.amount,
            note: txToConfirm.description,
            attachmentUrl: txToConfirm.attachmentUrl,
            requestId: txToConfirm.id,
            locale: dictionary.locale as 'en' | 'zh-TW',
        });

        toast({
            title: dictionary.activity.paymentSuccessTitle,
            description: `${dictionary.activity.paymentSuccessDescription} ${formatCurrency(txToConfirm.amount, currency)} to ${txToConfirm.name}.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: dictionary.activity.paymentFailedTitle,
            description: error.message || dictionary.activity.genericError,
        });
    } finally {
        setIsConfirming(false);
        setTxToConfirm(null);
    }
  }

  const executeDecline = async () => {
      if (!txToConfirm || !user) return;
      setIsConfirming(true);
      try {
          await declineTransaction({
            payerTxId: txToConfirm.id,
            requesterId: txToConfirm.otherPartyUid,
            locale: dictionary.locale as 'en' | 'zh-TW',
          });
          toast({
              title: dictionary.activity.requestDeclinedTitle,
              description: `${dictionary.activity.requestDeclinedDescription} ${txToConfirm.name}.`,
          });
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: dictionary.activity.declineFailedTitle,
              description: error.message || dictionary.activity.genericError,
          });
      } finally {
          setIsConfirming(false);
          setTxToConfirm(null);
      }
  };


  const ActivitySkeleton = () => (
      <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
               <div key={i}>
                    <Skeleton className="h-6 w-24 mb-2 px-4 py-2" />
                    <Card>
                        <CardContent className="p-0 divide-y">
                             {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex items-center p-4 space-x-4">
                                    <Skeleton className="h-11 w-11 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                             ))}
                        </CardContent>
                    </Card>
               </div>
          ))}
      </div>
  )

  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={isConfirming} />
      <header>
        <h1 className="text-3xl font-bold">{dictionary.activity.title}</h1>
      </header>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">{dictionary.activity.tabs.all}</TabsTrigger>
          <TabsTrigger value="payments">{dictionary.activity.tabs.sent}</TabsTrigger>
          <TabsTrigger value="receipts">{dictionary.activity.tabs.received}</TabsTrigger>
        </TabsList>
        {isLoading ? <ActivitySkeleton /> : (
            <>
                <TabsContent value="all" className="rounded-xl overflow-hidden">
                  <Card>
                    <CardContent className="p-0">
                        <TransactionList transactions={transactionsWithDetails} currency={currency} onTransactionClick={handleTransactionClick} onConfirmPayment={handleConfirmPayment} dictionary={dictionary.activity} />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="payments" className="rounded-xl overflow-hidden">
                  <Card>
                    <CardContent className="p-0">
                        <TransactionList transactions={payments} currency={currency} onTransactionClick={handleTransactionClick} onConfirmPayment={handleConfirmPayment} dictionary={dictionary.activity}/>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="receipts" className="rounded-xl overflow-hidden">
                  <Card>
                    <CardContent className="p-0">
                        <TransactionList transactions={receipts} currency={currency} onTransactionClick={handleTransactionClick} onConfirmPayment={handleConfirmPayment} dictionary={dictionary.activity}/>
                    </CardContent>
                  </Card>
                </TabsContent>
            </>
        )}
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[85vh]">
            <DialogHeader className="p-6 pb-4">
                <DialogTitle className="sr-only">Transaction Details</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-6">
                {selectedTx && <TransactionDetails transaction={selectedTx} dictionary={dictionary.transactionDetails} />}
            </div>
        </DialogContent>
      </Dialog>
      
      {txToConfirm && (
        <AlertDialog open={!!txToConfirm} onOpenChange={() => setTxToConfirm(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">{dictionary.activity.confirmPaymentTitle}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                         <div className="flex flex-col items-center text-center space-y-4 py-4">
                             <Avatar className="h-16 w-16">
                                <AvatarImage src={txToConfirm.otherParty?.photoURL} alt={txToConfirm.name} />
                                <AvatarFallback>{txToConfirm.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p dangerouslySetInnerHTML={{ __html: dictionary.activity.confirmPaymentDescription.replace('{amount}', formatCurrency(txToConfirm.amount, currency)).replace('{name}', txToConfirm.name) }} />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={executeDecline}>{dictionary.activity.decline}</AlertDialogCancel>
                    <AlertDialogAction onClick={executePaymentConfirmation}>{dictionary.activity.confirmAndPay}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}
