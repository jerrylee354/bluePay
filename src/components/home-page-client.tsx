
"use client";

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Dictionary } from "@/dictionaries";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import Dashboard from "./dashboard";
import VerifiedAvatar from "./VerifiedAvatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const TransactionIcon = ({ type }: { type: Transaction["type"] }) => {
  if (type === "payment") {
    return (
      <div className="p-2 bg-destructive/10 rounded-full">
        <ArrowUpRight className="w-5 h-5 text-destructive" />
      </div>
    );
  }
  return (
    <div className="p-2 bg-accent/10 rounded-full">
      <ArrowDownLeft className="w-5 h-5 text-accent" />
    </div>
  );
};

const RecentActivity = ({ transactions, userData, dictionary }: { transactions: Transaction[], userData: any, dictionary: Dictionary['home'] }) => (
    <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{dictionary.recentActivity}</h2>
          <Link href="/activity" className="text-sm font-medium text-primary hover:underline">
            {dictionary.viewAll}
          </Link>
        </div>
        <Card>
            <CardContent className="p-0">
              {transactions.length > 0 ? (
                <ul className="divide-y">
                    {transactions.map((tx) => (
                        <li key={tx.id} className="flex items-center p-4 space-x-4">
                            <TransactionIcon type={tx.type} />
                            <div className="flex-1">
                                <p className="font-semibold">{tx.name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <p className={cn(
                                "font-bold",
                                tx.type === 'payment' ? 'text-destructive' : 'text-accent'
                            )}>
                                {tx.type === 'payment' ? '-' : '+'}
                                {formatCurrency(tx.amount, userData?.currency || 'USD')}
                            </p>
                        </li>
                    ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                    {dictionary.noRecentTransactions}
                </div>
              )}
            </CardContent>
        </Card>
      </div>
);

const DarkModeDialog = ({ open, onOpenChange, onTry, dictionary } : { open: boolean, onOpenChange: (open: boolean) => void, onTry: () => void, dictionary: Dictionary['home']['darkModeDialog'] }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => setIsAnimating(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [open]);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <style jsx>{`
                .dark-mode-reveal-bg {
                    animation: reveal-dark 8s ease-out forwards;
                }
                @keyframes reveal-dark {
                    from {
                        clip-path: circle(0% at 0% 100%);
                    }
                    to {
                        clip-path: circle(150% at 0% 100%);
                    }
                }
            `}</style>
            <DialogContent className="overflow-hidden p-0">
                <div className="relative p-6">
                    {isAnimating && <div className="dark-mode-reveal-bg absolute inset-0 bg-slate-900 -z-10" />}
                    <div className="relative z-10">
                        <DialogHeader>
                            <DialogTitle className={cn("transition-colors duration-500", isAnimating && "text-slate-50")}>{dictionary.title}</DialogTitle>
                            <DialogDescription className={cn("transition-colors duration-500", isAnimating && 'text-slate-400')}>{dictionary.description}</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 text-center">
                            <Wallet className={cn("w-20 h-20 mx-auto text-primary transition-colors duration-500", isAnimating && "text-slate-50")} />
                        </div>
                        <DialogFooter className="grid grid-cols-2 gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className={cn("transition-colors duration-500", isAnimating && 'text-slate-50 hover:bg-slate-800 hover:text-slate-50')}>{dictionary.close}</Button>
                            <Button onClick={onTry} className={cn("transition-colors duration-500", isAnimating && 'bg-slate-50 text-slate-900 hover:bg-slate-200')}>{dictionary.tryItNow}</Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function HomePageClient({ dictionary }: { dictionary: Dictionary }) {
  const { user, userData, transactions, isLoading } = useAuth();
  const { setTheme } = useTheme();
  const recentTransactions = transactions.slice(0, 4);
  const isMobile = useIsMobile();
  const d = dictionary.home;
  const isBusiness = userData?.accountType === 'business';
  
  const [showDarkModeDialog, setShowDarkModeDialog] = useState(false);

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem('hasSeenDarkModeDialog');
    if (!hasSeenDialog) {
      setShowDarkModeDialog(true);
    }
  }, []);

  const handleTryDarkMode = () => {
    setTheme('dark');
    localStorage.setItem('hasSeenDarkModeDialog', 'true');
    setShowDarkModeDialog(false);
  }

  const handleCloseDialog = () => {
    localStorage.setItem('hasSeenDarkModeDialog', 'true');
    setShowDarkModeDialog(false);
  }


  if (isLoading) {
      return <LoadingOverlay isLoading={true} />;
  }
  
  const BalanceCard = () => (
      <Card className="w-full shadow-lg bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-primary-foreground/80">
            {d.totalBalance}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData ? (
            <p className="text-4xl font-bold tracking-tight">
              {formatCurrency(userData.balance || 0, userData.currency || 'USD')}
            </p>
          ) : (
             <Skeleton className="h-10 w-48" />
          )}
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{d.welcome}</p>
          {userData?.firstName ? (
            <h1 className="text-2xl font-bold text-foreground">
              {userData.firstName}
            </h1>
          ) : (
            <Skeleton className="h-8 w-32 mt-1" />
          )}
        </div>
        {isMobile && (
          <Link href="/settings">
              <VerifiedAvatar user={userData} className="h-12 w-12 cursor-pointer" />
          </Link>
        )}
      </header>
        
      {isBusiness ? (
        <>
            <BalanceCard />
            <Dashboard transactions={transactions} dictionary={dictionary} timeframe="all-time" showRevenueChartOnly={true} />
        </>
      ) : (
        <>
            <BalanceCard />
            <RecentActivity transactions={recentTransactions} userData={userData} dictionary={d} />
        </>
      )}

      <DarkModeDialog
        open={showDarkModeDialog}
        onOpenChange={handleCloseDialog}
        onTry={handleTryDarkMode}
        dictionary={d.darkModeDialog}
      />
    </div>
  );
}
