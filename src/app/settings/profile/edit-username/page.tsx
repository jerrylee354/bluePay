
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { type SettingsPage } from '@/components/settings-container';
import { Dictionary } from '@/dictionaries';

export default function EditUsernamePage({ setPage, dictionary }: { setPage?: (page: SettingsPage) => void, dictionary: Dictionary['settings'] }) {
    const { user, userData, refreshUserData, checkUsernameExists } = useAuth();
    const { toast } = useToast();
    const d = dictionary.profile;
    
    const originalUsername = userData?.username || '';
    const [username, setUsername] = useState(originalUsername.replace(/^@/, ''));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNavigation = (page: SettingsPage) => {
        if (setPage) {
            setPage(page);
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_.]/g, ''));
    };

    const handleSave = async () => {
        setError(null);
        if (!user) {
            toast({ variant: 'destructive', title: d.authError });
            return;
        }

        if (!username || username.length < 3) {
            setError(d.usernameLengthError);
            return;
        }

        setIsLoading(true);
        const finalUsername = `@${username}`;

        if (finalUsername !== originalUsername) {
            const isTaken = await checkUsernameExists(finalUsername);
            if (isTaken) {
                setError(d.usernameTakenError);
                setIsLoading(false);
                return;
            }
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { username: finalUsername });
            await refreshUserData();
            toast({ title: d.usernameUpdated, description: d.usernameSaved });
            if (setPage) {
              setPage('profile');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: d.updateFailed, description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background">
            <LoadingOverlay isLoading={isLoading} />
             <div className="flex items-center justify-end mb-6">
                 <Button onClick={handleSave} disabled={isLoading || !username || `@${(username || '')}` === originalUsername}>
                    {d.save}
                </Button>
            </div>

            <div className="space-y-4">
                <div className="flex h-12 items-center rounded-md border border-input px-3 has-[:focus]:ring-2 has-[:focus]:ring-ring">
                    <span className="text-muted-foreground">@</span>
                    <Input 
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="username"
                        className="h-auto flex-1 border-0 bg-transparent p-0 pl-1 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                 {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive pt-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
                <p className="text-sm text-muted-foreground">
                    {d.usernameDescription}
                </p>
            </div>
        </div>
    );
}
