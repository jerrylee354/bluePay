import SignupPageClient from '@/components/signup-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function SignupPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <SignupPageClient dictionary={dictionary} />;
}
