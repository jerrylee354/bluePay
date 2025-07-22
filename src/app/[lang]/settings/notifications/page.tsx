"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { SettingsPage } from '@/components/settings-container';
import { Dictionary } from '@/dictionaries';

const SettingsListItem = ({ title, description, action }: { title: string, description: string, action: React.ReactNode }) => (
    <div className="flex items-center p-4">
        <div className="flex-1">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
    </div>
);


export default function NotificationSettingsPage({ setPage, dictionary }: { setPage?: (page: SettingsPage) => void, dictionary: Dictionary['settings'] }) {
    const d = dictionary.notifications;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{d.title}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                   <SettingsListItem 
                        title={d.push}
                        description={d.pushDescription}
                        action={<Switch id="push-switch" defaultChecked />}
                   />
                   <SettingsListItem 
                        title={d.email}
                        description={d.emailDescription}
                        action={<Switch id="email-switch" defaultChecked />}
                   />
                </CardContent>
            </Card>
        </div>
    );
}
