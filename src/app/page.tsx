import LandingPage from '@/app/(app)/page';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '../../i18n';

// This is the new root page that will handle locale detection
// and pass the correct dictionary to the actual landing page component.
export default async function RootPage({ params }: { params: { lang: Locale }}) {
  const dictionary = await getDictionary(params.lang);
  return <LandingPage dictionary={dictionary.landing} />;
}
