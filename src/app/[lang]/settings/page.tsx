

import SettingsContainer from '@/components/settings-container';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';


export default async function SettingsPage({ params }: { params: { lang: Locale } }) {
  const dictionary = await getDictionary(params.lang);

  return <SettingsPageClient dictionary={dictionary} />;
}

"use client";

function SettingsPageClient({ dictionary }: { dictionary: any }) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
    };

    const handleClose = () => {
        router.back();
    };
    
    return (
      <SettingsContainer
        dictionary={dictionary}
        onLogout={handleLogout}
        onClose={handleClose}
      />
    );
}
