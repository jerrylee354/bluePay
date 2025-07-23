import ScanTicketPageClient from '@/components/scan-ticket-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';
import { Suspense } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export default async function ScanWalletItemPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return (
    <Suspense fallback={<LoadingOverlay isLoading={true} />}>
        <ScanTicketPageClient dictionary={dictionary} mode="add" />
    </Suspense>
  );
}
