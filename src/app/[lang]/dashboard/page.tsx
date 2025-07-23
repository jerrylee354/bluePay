
import DashboardPageClient from '@/components/dashboard-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function DashboardPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <DashboardPageClient dictionary={dictionary} />;
}
