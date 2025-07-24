
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X, User, Shield, Eye, Bell, LogOut, Palette } from 'lucide-react';
import { Dictionary } from '@/dictionaries';
import { Card, CardContent } from '@/components/ui/card';
import ProfilePage from '@/app/[lang]/settings/profile/page';
import SecurityPage from '@/app/[lang]/settings/security/page';
import PrivacySettingsPage from '@/app/[lang]/settings/privacy/page';
import NotificationSettingsPage from '@/app/[lang]/settings/notifications/page';
import EditUsernamePage from '@/app/[lang]/settings/profile/edit-username/page';
import ThemeSettingsPage from '@/app/[lang]/settings/theme/page';
import { useAuth } from '@/context/auth-context';
import { Badge } from './ui/badge';

export type SettingsPage = 'main' | 'profile' | 'security' | 'privacy' | 'notifications' | 'theme' | 'edit-username';

const SettingsListItem = ({ icon: Icon, text, onClick, badgeText }: { icon: React.ElementType, text: string, onClick: () => void, badgeText?: string }) => (
    <div onClick={onClick} className="flex items-center p-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
        <Icon className="w-6 h-6 mr-4 text-muted-foreground" />
        <div className="flex-1 flex items-center gap-2">
            <span className="text-base font-medium">{text}</span>
            {badgeText && <Badge variant="outline" className="border-primary text-primary">{badgeText}</Badge>}
        </div>
        <ChevronLeft className="w-5 h-5 text-muted-foreground transform rotate-180" />
    </div>
);

export default function SettingsContainer({ dictionary, onClose }: { dictionary: Dictionary, onClose: () => void }) {
    const [page, setPage] = useState<SettingsPage>('main');
    const { logout } = useAuth();


    const handleLogout = () => {
        logout();
    }

    const components: Record<Exclude<SettingsPage, 'main'>, React.ComponentType<any>> = {
        profile: ProfilePage,
        security: SecurityPage,
        privacy: PrivacySettingsPage,
        notifications: NotificationSettingsPage,
        theme: ThemeSettingsPage,
        'edit-username': EditUsernamePage,
    };

    const pageConfig: Record<SettingsPage, { title: string; component?: React.ComponentType<any>; backPage?: SettingsPage }> = {
        main: { title: dictionary.settings.title },
        profile: { title: dictionary.settings.profile.title, component: components.profile, backPage: 'main' },
        security: { title: dictionary.settings.security.title, component: components.security, backPage: 'main' },
        privacy: { title: dictionary.settings.privacy.title, component: components.privacy, backPage: 'main' },
        notifications: { title: dictionary.settings.notifications.title, component: components.notifications, backPage: 'main' },
        theme: { title: dictionary.settings.theme.title, component: components.theme, backPage: 'main'},
        'edit-username': { title: dictionary.settings.profile.editUsername, component: components['edit-username'], backPage: 'profile' },
    };

    const { title, component: PageComponent, backPage } = pageConfig[page];

    const handleBack = () => {
        if (backPage) {
            setPage(backPage);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-background">
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
                    {page === 'main' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>
                    )}
                </div>
            </header>
            <div className="p-4 md:p-6 overflow-y-auto flex-grow">
                {PageComponent ? <PageComponent setPage={setPage} dictionary={dictionary.settings} /> : (
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-2">
                                <SettingsListItem icon={User} text={dictionary.settings.profile.title} onClick={() => setPage('profile')} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-2 divide-y">
                                <SettingsListItem icon={Shield} text={dictionary.settings.security.title} onClick={() => setPage('security')} />
                                <SettingsListItem icon={Eye} text={dictionary.settings.privacy.title} onClick={() => setPage('privacy')} />
                                <SettingsListItem icon={Bell} text={dictionary.settings.notifications.title} onClick={() => setPage('notifications')} />
                                <SettingsListItem 
                                    icon={Palette} 
                                    text={dictionary.settings.theme.title} 
                                    onClick={() => setPage('theme')}
                                    badgeText={dictionary.settings.theme.beta}
                                />
                            </CardContent>
                        </Card>

                        <div className="pt-4">
                             <Button variant="destructive" className="w-full h-12 text-base" onClick={handleLogout}>
                                <LogOut className="mr-2 h-5 w-5" />
                                {dictionary.settings.logout}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
