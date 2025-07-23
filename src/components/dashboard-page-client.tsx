
"use client";

import { useAuth } from '@/context/auth-context';
import Dashboard from '@/components/dashboard';
import { Dictionary } from '@/dictionaries';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingOverlay } from './ui/loading-overlay';

export default function DashboardPageClient({ dictionary }: { dictionary: Dictionary }) {
  const { transactions, userData, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && userData?.accountType !== 'business') {
      router.push('/home');
    }
  }, [userData, isLoading, router]);

  if (isLoading || userData?.accountType !== 'business') {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="space-y-6">
      <Dashboard transactions={transactions} dictionary={dictionary} timeframe="all-time" />
    </div>
  );
}
