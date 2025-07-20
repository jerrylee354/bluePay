
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldCheck } from 'lucide-react';
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

export default function SecurityPage({ setPage }: { setPage?: (page: SettingsPage) => void }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                   <SettingsListItem 
                        icon={KeyRound}
                        title="Change Password"
                        description="Last changed on 12/01/2024"
                        action={<Button variant="outline">Change</Button>}
                   />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                </CardHeader>
                 <CardContent className="divide-y p-0">
                   <SettingsListItem 
                        icon={ShieldCheck}
                        title="Two-Factor Authentication"
                        description="For added security, require a code to log in."
                        action={<Switch id="2fa-switch" />}
                   />
                </CardContent>
            </Card>
        </div>
    );
}
