
"use client";

import { ArrowUpRight, ArrowDownLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Dictionary } from "@/dictionaries";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

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

const BusinessDashboardPlaceholder = ({ dictionary }: { dictionary: Dictionary['home']}) => (
    <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{dictionary.dashboard}</h2>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
            <LayoutDashboard className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground">{dictionary.businessDashboardComingSoon}</p>
        </div>
    </div>
);

export default function HomePageClient({ dictionary }: { dictionary: Dictionary }) {
  const { user, userData, transactions, isLoading } = useAuth();
  const recentTransactions = transactions.slice(0, 4);
  const isMobile = useIsMobile();
  const d = dictionary.home;
  const isBusiness = userData?.accountType === 'business';

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  if (isLoading) {
      return <LoadingOverlay isLoading={true} />;
  }

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
      
      {isBusiness ? (
        <BusinessDashboardPlaceholder dictionary={d} />
      ) : (
        <RecentActivity transactions={recentTransactions} userData={userData} dictionary={d} />
      )}
    </div>
  );
}
