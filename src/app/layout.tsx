
import AppContent from '@/components/app-content';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { getDictionary } from '@/dictionaries';
import { headers } from 'next/headers';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n, type Locale } from '@/i18n';

function getLocale(): Locale {
  const negotiatorHeaders: Record<string, string> = {}
  headers().forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales

  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale as Locale;
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLocale();
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang}>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <AppContent dictionary={dictionary}>
            {children}
          </AppContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
