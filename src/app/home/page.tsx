
"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";

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

export default function HomePage() {
  const { user, userData, transactions } = useAuth();
  const recentTransactions = transactions.slice(0, 4);
  const isMobile = useIsMobile();

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Welcome Back,</p>
          <h1 className="text-2xl font-bold text-foreground">{userData?.firstName || user?.email || 'User'}</h1>
        </div>
        {isMobile && (
          <Link href="/settings">
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarImage src={userData?.photoURL || ""} alt="User Avatar" />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
          </Link>
        )}
      </header>

      <Card className="w-full shadow-lg bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-sm font-normal text-primary-foreground/80">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData ? (
            <p className="text-4xl font-bold tracking-tight">
              {formatCurrency(userData.balance || 0, userData.currency || 'USD')}
            </p>
          ) : (
            <Skeleton className="h-10 w-48 bg-primary/20" />
          )}
        </CardContent>
      </Card>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/activity" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>
        <Card>
            <CardContent className="p-0">
              {transactions.length === 0 && !user ? (
                 <div className="p-8 text-center text-muted-foreground">
                    Loading transactions...
                </div>
              ) : recentTransactions.length > 0 ? (
                <ul className="divide-y">
                    {recentTransactions.map((tx) => (
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
                    No recent transactions.
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
