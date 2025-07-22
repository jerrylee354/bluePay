import PayPageClient from '@/components/pay-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function PayPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <PayPageClient dictionary={dictionary} />;
}
