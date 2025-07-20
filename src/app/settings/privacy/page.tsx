
"use client";

import Link from 'next/link';
import { FileText, Database, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SettingsPage } from '@/components/settings-container';

const SettingsListItem = ({ icon: Icon, title, description, isExternalLink = false, onClick }: { icon: React.ElementType, title: string, description: string, isExternalLink?: boolean, onClick?: () => void }) => (
    <div 
        className="block hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
        onClick={onClick}
    >
        <div className="flex items-center p-4">
            <Icon className="w-6 h-6 mr-4 text-muted-foreground" />
            <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
    </div>
);


export default function PrivacySettingsPage({ setPage }: { setPage?: (page: SettingsPage) => void }) {
    
    const handleNavigation = (page: string) => {
        // This is a placeholder for now.
        // In a real app, you might navigate to a new dialog page
        // or open a link in a new tab.
        if (page === '/privacy') {
            window.open(page, '_blank');
        }
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Manage Your Data</CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                    <SettingsListItem
                        icon={Database}
                        title="Manage your data"
                        description="Download or delete your account data."
                        onClick={() => alert("Feature coming soon!")}
                    />
                     <SettingsListItem
                        icon={FileText}
                        title="Privacy Policy"
                        description="Read our privacy policy."
                        onClick={() => handleNavigation('/privacy')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
