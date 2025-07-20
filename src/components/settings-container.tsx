
"use client";

import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import SettingsPage from '@/app/settings/page';
import ProfilePage from '@/app/settings/profile/page';
import SecurityPage from '@/app/settings/security/page';
import PrivacySettingsPage from '@/app/settings/privacy/page';
import NotificationSettingsPage from '@/app/settings/notifications/page';
import EditUsernamePage from '@/app/settings/profile/edit-username/page';

export type SettingsPage = 'main' | 'profile' | 'security' | 'privacy' | 'notifications' | 'edit-username';

const pageConfig: Record<SettingsPage, { title: string; component: React.ComponentType<any>; backPage?: SettingsPage }> = {
    main: { title: 'Settings', component: SettingsPage },
    profile: { title: '編輯個人檔案', component: ProfilePage, backPage: 'main' },
    security: { title: '登入和安全性', component: SecurityPage, backPage: 'main' },
    privacy: { title: '資料與隱私權', component: PrivacySettingsPage, backPage: 'main' },
    notifications: { title: '通知偏好設定', component: NotificationSettingsPage, backPage: 'main' },
    'edit-username': { title: '使用者名稱', component: EditUsernamePage, backPage: 'profile'},
};

const SettingsContainer = ({ page, setPage }: { page: SettingsPage; setPage: (page: SettingsPage) => void }) => {
    const { title, component: PageComponent, backPage } = pageConfig[page];

    const handleBack = () => {
        if (backPage) {
            setPage(backPage);
        }
    }

    return (
        <div>
            <DialogHeader className="p-6 pb-4 border-b">
                <div className="flex items-center gap-4">
                    {page !== 'main' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                            <ChevronLeft className="h-5 w-5" />
                            <span className="sr-only">Back</span>
                        </Button>
                    )}
                    <DialogTitle>{title}</DialogTitle>
                </div>
            </DialogHeader>
            <div className="p-6">
                <PageComponent setPage={setPage} />
            </div>
        </div>
    );
};

export default SettingsContainer;
