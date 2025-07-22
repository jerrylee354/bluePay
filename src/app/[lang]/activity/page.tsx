import ActivityPageClient from '@/components/activity-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function ActivityPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <ActivityPageClient dictionary={dictionary} />;
}
