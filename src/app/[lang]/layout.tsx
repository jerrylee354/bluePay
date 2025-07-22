import AppContent from '@/components/app-content';
import { getDictionary } from '@/dictionaries';
import { i18n, type Locale } from '@/i18n';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(params.lang);
  return (
    <AppContent dictionary={dictionary}>
      {children}
    </AppContent>
  );
}
