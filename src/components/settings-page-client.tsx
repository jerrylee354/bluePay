
"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import SettingsContainer, { type SettingsPage } from './settings-container';
import { Dictionary } from '@/dictionaries';

export default function SettingsPageClient({ dictionary }: { dictionary: Dictionary }) {
    const { logout } = useAuth();
    const [page, setPage] = React.useState<SettingsPage>('main');

    return (
        <SettingsContainer 
            page={page} 
            setPage={setPage} 
            dictionary={dictionary}
            onLogout={logout} 
        />
    );
}
