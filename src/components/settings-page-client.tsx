
"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import SettingsContainer, { type SettingsPage } from './settings-container';
import { Dictionary } from '@/dictionaries';
import { useRouter } from 'next/navigation';

export default function SettingsPageClient({ dictionary }: { dictionary: Dictionary }) {
    const { logout } = useAuth();
    const router = useRouter();
    const [page, setPage] = React.useState<SettingsPage>('main');

    const handleLogout = () => {
        logout();
        router.push(`/${dictionary.locale}/login`);
    }

    return (
        <SettingsContainer 
            page={page} 
            setPage={setPage} 
            dictionary={dictionary}
            onLogout={handleLogout} 
        />
    );
}
