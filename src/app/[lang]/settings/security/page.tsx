
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { SettingsPage } from '@/components/settings-container';
import { Dictionary } from '@/dictionaries';

const SettingsListItem = ({ icon: Icon, title, description, action }: { icon: React.ElementType, title: string, description: string, action: React.ReactNode }) => (
    <div className="flex items-center p-4">
        <Icon className="w-6 h-6 mr-4 text-muted-foreground" />
        <div className="flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
    </div>
);

export default function SecurityPage({ setPage, dictionary }: { setPage?: (page: SettingsPage) => void, dictionary: Dictionary['settings'] }) {
    const d = dictionary.security;
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{d.login.title}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                   <SettingsListItem 
                        icon={KeyRound}
                        title={d.login.changePassword}
                        description={d.login.lastChanged}
                        action={<Button variant="outline">{d.login.changeButton}</Button>}
                   />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{d.security.title}</CardTitle>
                </CardHeader>
                 <CardContent className="divide-y p-0">
                   <SettingsListItem 
                        icon={ShieldCheck}
                        title={d.security.twoFactorAuth}
                        description={d.security.twoFactorDescription}
                        action={<Switch id="2fa-switch" />}
                   />
                </CardContent>
            </Card>
        </div>
    );
}
