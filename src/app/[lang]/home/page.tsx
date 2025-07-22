import HomePageClient from '@/components/home-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <HomePageClient dictionary={dictionary} />;
}
