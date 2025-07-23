
"use client";

import { useAuth } from '@/context/auth-context';
import Dashboard from '@/components/dashboard';
import { Dictionary } from '@/dictionaries';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { LoadingOverlay } from './ui/loading-overlay';
import { type Transaction } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TransactionDetails from '@/components/transaction-details';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
                <p className={cn("font-bold text-lg", tx.type === 'payment' ? 'text-foreground' : 'text-accent')}>
                    {tx.type === 'payment' ? '- ' : '+ '}
                    {formatCurrency(tx.amount, currency)}
                </p>
                <Badge variant="outline" className={cn("border-none text-xs", statusStyles[tx.status] || statusStyles['Pending'])}>
                    {tx.status}
                </Badge>
            </div>
        </li>
    );
};

const ActivityList = ({ transactions, currency, onTransactionClick }: { transactions: Transaction[], currency: string, onTransactionClick: (tx: Transaction) => void }) => {
    if (transactions.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                {/* A dictionary key could be used here */}
                No transactions to display.
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
};

export default function DashboardPageClient({ dictionary }: { dictionary: Dictionary }) {
  const { transactions, userData, isLoading, getUserById } = useAuth();
  const router = useRouter();
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [transactionsWithDetails, setTransactionsWithDetails] = useState<Transaction[]>([]);
  
  useEffect(() => {
    if (!isLoading && userData?.accountType !== 'business') {
      router.push('/home');
    }
  }, [userData, isLoading, router]);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
        if (transactions.length === 0) {
            setTransactionsWithDetails([]);
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
    };
    
    fetchTransactionDetails();
  }, [transactions, getUserById]);

  if (isLoading || !userData || userData.accountType !== 'business') {
    return <LoadingOverlay isLoading={true} />;
  }

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTx(null), 300);
  };
  
  return (
    <div className="space-y-6">
      <Dashboard transactions={transactions} dictionary={dictionary} timeframe="all-time" />
      <Separator />
       <div>
            <h2 className="text-2xl font-bold mb-4">{dictionary.home.recentActivity}</h2>
            <ActivityList 
                transactions={transactionsWithDetails} 
                currency={userData?.currency || 'USD'} 
                onTransactionClick={handleTransactionClick} 
            />
       </div>

        <Dialog open={isDetailOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[85vh]">
                <DialogHeader className="p-6 pb-4 sr-only">
                    <DialogTitle>{dictionary.transactionDetails.title}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto px-6 pb-6">
                    {selectedTx && <TransactionDetails transaction={selectedTx} onCancel={() => {}} dictionary={dictionary} />}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
