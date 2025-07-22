
"use client";

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Shield, Eye, Bell, LogOut, ChevronRight } from 'lucide-react';
import type { SettingsPage } from '@/components/settings-container';
import { Dictionary } from '@/dictionaries';

const SettingsListItem = ({ icon: Icon, text, onClick }: { icon: React.ElementType, text: string, onClick: () => void }) => (
    <div onClick={onClick} className="flex items-center p-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
        <Icon className="w-6 h-6 mr-4 text-muted-foreground" />
        <span className="flex-1 text-base font-medium">{text}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
);

export default function SettingsPage({ setPage, dictionary }: { setPage?: (page: SettingsPage) => void, dictionary: Dictionary['settings'] }) {
    const { logout } = useAuth();
    
    const handleNavigation = (page: SettingsPage) => {
        if (setPage) {
            setPage(page);
        }
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardContent className="p-2">
                    <SettingsListItem icon={User} text={dictionary.profile.title} onClick={() => handleNavigation('profile')} />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-2">
                    <SettingsListItem icon={Shield} text={dictionary.security.title} onClick={() => handleNavigation('security')} />
                    <SettingsListItem icon={Eye} text={dictionary.privacy.title} onClick={() => handleNavigation('privacy')} />
                    <SettingsListItem icon={Bell} text={dictionary.notifications.title} onClick={() => handleNavigation('notifications')} />
                </CardContent>
            </Card>

             <Card>
                <CardContent className="p-2">
                     <div className="flex items-center p-4 hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors" onClick={logout}>
                        <LogOut className="w-6 h-6 mr-4 text-destructive" />
                        <span className="flex-1 text-base font-medium text-destructive">{dictionary.logout}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
