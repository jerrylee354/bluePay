
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/settings/profile/page';
import SecurityPage from '@/app/settings/security/page';
import PrivacySettingsPage from '@/app/settings/privacy/page';
import NotificationSettingsPage from '@/app/[lang]/settings/notifications/page';
import EditUsernamePage from '@/app/settings/profile/edit-username/page';
import { Dictionary } from '@/dictionaries';

export type SettingsPage = 'main' | 'profile' | 'security' | 'privacy' | 'notifications' | 'edit-username';

const SettingsContainer = ({ page, setPage, dictionary, onLogout, onClose }: { page: SettingsPage; setPage: (page: SettingsPage) => void, dictionary: Dictionary, onLogout: () => void, onClose?: () => void }) => {
    
    const pageConfig: Record<SettingsPage, { title: string; component: React.ComponentType<any>; backPage?: SettingsPage }> = {
        main: { title: dictionary.settings.title, component: SettingsPage },
        profile: { title: dictionary.settings.profile.title, component: ProfilePage, backPage: 'main' },
        security: { title: dictionary.settings.security.title, component: SecurityPage, backPage: 'main' },
        privacy: { title: dictionary.settings.privacy.title, component: PrivacySettingsPage, backPage: 'main' },
        notifications: { title: dictionary.settings.notifications.title, component: NotificationSettingsPage, backPage: 'main' },
        'edit-username': { title: dictionary.settings.profile.editUsername, component: EditUsernamePage, backPage: 'profile'},
    };

    const { title, component: PageComponent, backPage } = pageConfig[page];

    const handleBack = () => {
        if (backPage) {
            setPage(backPage);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 md:p-6 pb-4 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         {page !== 'main' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                                <ChevronLeft className="h-5 w-5" />
                                <span className="sr-only">Back</span>
                            </Button>
                        )}
                        <h2 className='text-lg font-semibold leading-none tracking-tight'>{title}</h2>
                    </div>
                     {page === 'main' && onClose && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    )}
                </div>
            </header>
            <div className="p-4 md:p-6 overflow-y-auto flex-grow">
                <PageComponent setPage={setPage} dictionary={dictionary} onLogout={onLogout} />
            </div>
        </div>
    );
};

export default SettingsContainer;
