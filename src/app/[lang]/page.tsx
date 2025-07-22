import LandingPage from '@/app/(app)/page';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function RootPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <LandingPage dictionary={dictionary.landing} />;
}
