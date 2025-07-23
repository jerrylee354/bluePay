
import OrdersPageClient from '@/components/orders-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function OrdersPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <OrdersPageClient dictionary={dictionary} />;
}
