import SettingsPageClient from '@/components/settings-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function SettingsPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);
  return <SettingsPageClient dictionary={dictionary} />;
}
