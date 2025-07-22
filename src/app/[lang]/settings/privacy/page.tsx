
"use client";

import Link from 'next/link';
import { FileText, Database, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SettingsPage } from '@/components/settings-container';
import { Dictionary } from '@/dictionaries';

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


export default function PrivacySettingsPage({ setPage, dictionary }: { setPage?: (page: SettingsPage) => void, dictionary: Dictionary['settings'] }) {
    const d = dictionary.privacy;
    
    const handleNavigation = (page: string) => {
        if (page === '/privacy') {
            window.open(page, '_blank');
        }
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>{d.manageData.title}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                    <SettingsListItem
                        icon={Database}
                        title={d.manageData.manage}
                        description={d.manageData.manageDescription}
                        onClick={() => alert("Feature coming soon!")}
                    />
                     <SettingsListItem
                        icon={FileText}
                        title={d.manageData.policy}
                        description={d.manageData.policyDescription}
                        onClick={() => handleNavigation('/privacy')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
