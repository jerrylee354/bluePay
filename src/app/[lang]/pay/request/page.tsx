import RequestPageClient from '@/components/request-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function RequestPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <RequestPageClient dictionary={dictionary} />;
}
