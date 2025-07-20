
"use client";

import { Bell, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { SettingsPage } from '@/components/settings-container';

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


export default function NotificationSettingsPage({ setPage }: { setPage?: (page: SettingsPage) => void }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="divide-y p-0">
                   <SettingsListItem 
                        icon={Bell}
                        title="Push Notifications"
                        description="Receive alerts about your account activity."
                        action={<Switch id="push-notifications" defaultChecked />}
                   />
                   <SettingsListItem 
                        icon={Mail}
                        title="Email Notifications"
                        description="Get promotional and account-related emails."
                        action={<Switch id="email-notifications" defaultChecked />}
                   />
                </CardContent>
            </Card>
        </div>
    );
}
