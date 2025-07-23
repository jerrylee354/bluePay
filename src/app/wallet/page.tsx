
import WalletPageClient from '@/components/wallet-page-client';
import { getDictionary } from '@/dictionaries';
import { i18n, type Locale } from '@/i18n';
import { headers } from 'next/headers';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { Suspense } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

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

export default async function WalletPage() {
  const lang = getLocale();
  const dictionary = await getDictionary(lang);
  return (
    <Suspense fallback={<LoadingOverlay isLoading={true} />}>
      <WalletPageClient dictionary={dictionary} />
    </Suspense>
  );
}
