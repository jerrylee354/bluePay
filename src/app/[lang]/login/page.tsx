import LoginPageClient from '@/components/login-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function LoginPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <LoginPageClient dictionary={dictionary} />;
}
