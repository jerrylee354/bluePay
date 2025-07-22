import WalletPageClient from '@/components/wallet-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function WalletPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <WalletPageClient dictionary={dictionary} />;
}
