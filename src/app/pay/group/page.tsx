
import Link from 'next/link';
import { Users, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/dictionaries';
import { i18n, type Locale } from '@/i18n';
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

export default async function GroupPayPage() {
    const lang = getLocale();
    const dictionary = await getDictionary(lang);
    const d = dictionary.pay;

    return (
        <div className="space-y-6">
            <header className="relative flex items-center justify-center h-14">
                <Link href="/pay" className="absolute left-0">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-6 w-6" />
                         <span className="sr-only">Back to Pay</span>
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">{d.groupPayment}</h1>
            </header>
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                <Users className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground">{d.featureUnderConstruction}</p>
            </div>
            <Button className="w-full" disabled>
                {d.createNewGroup}
            </Button>
        </div>
    );
}
