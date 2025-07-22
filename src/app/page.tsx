import LandingPage from '@/app/(app)/page';
import { getDictionary } from '@/dictionaries';
import { type Locale, i18n } from '@/i18n';
import { headers } from 'next/headers';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(): Locale {
  const negotiatorHeaders: Record<string, string> = {};
  headers().forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;

  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale as Locale;
}


// This is the new root page that will handle locale detection
// and pass the correct dictionary to the actual landing page component.
export default async function RootPage() {
  const lang = getLocale();
  const dictionary = await getDictionary(lang);
  return <LandingPage dictionary={dictionary.landing} />;
}
