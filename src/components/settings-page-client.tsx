"use client";

import SettingsContainer from '@/components/settings-container';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { type Dictionary } from '@/dictionaries';

export default function SettingsPageClient({ dictionary }: { dictionary: Dictionary }) {
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
