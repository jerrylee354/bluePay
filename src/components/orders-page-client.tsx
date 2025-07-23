
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from "@/components/ui/card";
import { type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TransactionDetails from '@/components/transaction-details';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Dictionary } from '@/dictionaries';
import { Plus, FilePlus, QrCode, ShoppingCart } from 'lucide-react';
import QRCode from 'qrcode.react';
import { Skeleton } from '@/components/ui/skeleton';
import VerifiedAvatar from './VerifiedAvatar';


function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

const statusStyles: { [key: string]: string } = {
    "Completed": "bg-green-100 text-green-700 hover:bg-green-100",
    "已完成": "bg-green-100 text-green-700 hover:bg-green-100",
    "Failed": "bg-red-100 text-red-700 hover:bg-red-100",
    "失敗": "bg-red-100 text-red-700 hover:bg-red-100",
    "Pending": "bg-gray-100 text-gray-700 hover:bg-gray-100",
    "待處理": "bg-gray-100 text-gray-700 hover:bg-gray-100",
    "Requested": "bg-blue-100 text-blue-700 hover:bg-blue-100",
    "已請求": "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

const TransactionItem = ({ tx, currency, onClick }: { tx: Transaction, currency: string, onClick: () => void }) => {
    
    return (
        <li className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-muted/50" onClick={onClick}>
            <VerifiedAvatar user={tx.otherParty} className="h-11 w-11" />
            <div className="flex-1 space-y-1">
                <p className="font-semibold">{tx.name}</p>
                <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
            </div>
            <div className="text-right">
                 <p className={cn("font-bold text-lg text-accent")}>
                    + {formatCurrency(tx.amount, currency)}
                </p>
                <p className={cn("text-xs font-semibold rounded-full px-2 py-0.5 inline-block", statusStyles[tx.status] || statusStyles['Pending'])}>
                    {tx.status}
                </p>
            </div>
        </li>
    );
};

const PendingOrdersList = ({ transactions, currency, onTransactionClick, dictionary }: { transactions: Transaction[], currency: string, onTransactionClick: (tx: Transaction) => void, dictionary: Dictionary }) => {
    if (transactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground min-h-[300px] flex flex-col items-center justify-center">
                <ShoppingCart className="w-16 h-16 mb-4 text-gray-400"/>
                <p className="font-semibold text-lg">{dictionary.orders.noPendingOrders}</p>
                <p className="text-sm">{dictionary.orders.noPendingOrdersDescription}</p>
            </div>
        );
    }
    
    return (
        <Card>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {transactions.map((tx) => (
                        <TransactionItem 
                            key={tx.id} 
                            tx={tx} 
                            currency={currency} 
                            onClick={() => onTransactionClick(tx)} 
                        />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default function OrdersPageClient({ dictionary }: { dictionary: Dictionary }) {
  const { transactions, userData, getUserById, user, cancelTransaction } = useAuth();
  const router = useRouter();
  const currency = userData?.currency || 'USD';
  const d_orders = dictionary.orders;
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txToCancel, setTxToCancel] = useState<Transaction | null>(null);

  const { toast } = useToast();
  
  const [qrValue, setQrValue] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  useEffect(() => {
    if (userData && userData.accountType !== 'business') {
        router.push('/home');
    }
  }, [userData, router]);

  useEffect(() => {
    if (!userData) return;

    const fetchTransactionDetails = async () => {
        setIsLoading(true);

        const pendingStatuses = [dictionary.status.Pending, dictionary.status.Requested];
        const filteredTxs = transactions.filter(tx => pendingStatuses.includes(tx.status) && tx.type === 'receipt');

        if (filteredTxs.length === 0) {
            setPendingTransactions([]);
            setIsLoading(false);
            return;
        }

        const detailedTxs = await Promise.all(
            filteredTxs.map(async (tx) => {
                if (tx.otherPartyUid) {
                    const otherParty = await getUserById(tx.otherPartyUid);
                    return { ...tx, otherParty };
                }
                return tx;
            })
        );
        setPendingTransactions(detailedTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLoading(false);
    };
    
    fetchTransactionDetails();
  }, [transactions, getUserById, dictionary.status, userData]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
        const baseUrl = window.location.origin;
        const lang = dictionary.locale;
        setQrValue(`${baseUrl}/${lang}/pay/confirm?userId=${user.uid}&mode=request`);
    }
  }, [user, dictionary.locale]);


  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  }

  const handleDialogClose = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTx(null), 300);
  }

  const handleCancelRequest = (tx: Transaction) => {
    setTxToCancel(tx);
    setIsDetailOpen(false); // Close details dialog
  };

  const executeCancel = async () => {
    if (!txToCancel || !user) return;
    setIsProcessing(true);
    try {
      await cancelTransaction({
        requesterId: user.uid,
        transactionId: txToCancel.id,
        requesteeId: txToCancel.otherPartyUid,
      });
      toast({
        title: dictionary.activity.cancelSuccessTitle,
        description: dictionary.activity.cancelSuccessDescription,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: dictionary.activity.cancelFailedTitle,
        description: error.message || dictionary.activity.genericError,
      });
    } finally {
      setIsProcessing(false);
      setTxToCancel(null);
    }
  };
  
  const getDisplayUsername = () => {
      if (!userData) return '';
      const { username, firstName } = userData;
      if (username) {
          return username.startsWith('@') ? username : `@${username}`;
      }
      return `@${firstName?.toLowerCase() || 'user'}`;
  }


  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={isProcessing} />
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{d_orders.title}</h1>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Plus className="h-5 w-5"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 mr-4">
                <div className="grid gap-4">
                    <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="justify-start">
                                <QrCode className="mr-2 h-4 w-4" />
                                {d_orders.actions.showQr}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-center">{dictionary.pay.receiveFromOthers}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center text-center px-4 py-6 space-y-6">
                                <div className="p-4 bg-white rounded-lg border flex items-center justify-center">
                                    {qrValue ? (
                                        <QRCode value={qrValue} size={192} />
                                    ) : (
                                        <Skeleton className="h-[192px] w-[192px]" />
                                    )}
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <VerifiedAvatar user={userData} className="h-12 w-12" />
                                    <div className="text-left">
                                        <p className="font-bold text-lg">{userData?.firstName} {userData?.lastName}</p>
                                        <p className="text-muted-foreground">{getDisplayUsername()}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" asChild className="justify-start">
                        <Link href="/orders/create">
                            <FilePlus className="mr-2 h-4 w-4" />
                            {d_orders.actions.createOrder}
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
      </header>
      
      {isLoading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : (
        <PendingOrdersList transactions={pendingTransactions} currency={currency} onTransactionClick={handleTransactionClick} dictionary={dictionary} />
      )}

      <Dialog open={isDetailOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[85vh]">
            <DialogHeader className="sr-only">
                <DialogTitle>{dictionary.transactionDetails.title}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-6">
                {selectedTx && <TransactionDetails transaction={selectedTx} onCancel={handleCancelRequest} dictionary={dictionary} />}
            </div>
        </DialogContent>
      </Dialog>
      
      {txToCancel && (
        <AlertDialog open={!!txToCancel} onOpenChange={() => setTxToCancel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dictionary.activity.cancelRequestTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {dictionary.activity.cancelRequestDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{dictionary.activity.goBack}</AlertDialogCancel>
              <AlertDialogAction onClick={executeCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {dictionary.activity.confirmCancel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

    </div>
  );
}
