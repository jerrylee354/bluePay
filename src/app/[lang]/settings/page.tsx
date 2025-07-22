
import SettingsPageClient from '@/components/settings-page-client';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

import ProfilePage from './profile/page';
import SecurityPage from './security/page';
import PrivacySettingsPage from './privacy/page';
import NotificationSettingsPage from './notifications/page';
import EditUsernamePage from './profile/edit-username/page';

export default async function SettingsPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);

  const components = {
    profile: ProfilePage,
    security: SecurityPage,
    privacy: PrivacySettingsPage,
    notifications: NotificationSettingsPage,
    'edit-username': EditUsernamePage,
  };

  return <SettingsPageClient dictionary={dictionary} components={components} />;
}
