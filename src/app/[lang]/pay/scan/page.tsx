import ScanToPayPageClient from '@/components/scan-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function ScanToPayPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <ScanToPayPageClient dictionary={dictionary} />;
}
