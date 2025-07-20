
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { DocumentData } from 'firebase/firestore';
import { ChevronLeft, Landmark, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';
const ProfileSkeleton = () => (
    <div className="flex flex-col items-center justify-center text-center space-y-4 pt-12">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="w-full max-w-sm pt-4">
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
        </div>
    </div>
);

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { getUserByUsername } = useAuth();
    
    const [profileUser, setProfileUser] = useState<DocumentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const usernameParam = params.username as string;

    useEffect(() => {
        if (!usernameParam) {
            setError("No username provided.");
            setIsLoading(false);
            return;
        }

        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure the username has an "@" prefix for the query
                const usernameWithAt = `@${decodeURIComponent(usernameParam)}`;
                const user = await getUserByUsername(usernameWithAt);
                if (user) {
                    setProfileUser(user);
                } else {
                    setError(`User with username "${usernameWithAt}" not found.`);
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch user profile.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [usernameParam, getUserByUsername]);
    
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    }

    const handlePay = () => {
        if (!profileUser) return;
        router.push(`/pay/confirm?userId=${profileUser.uid}`);
    }

    const handleRequest = () => {
        if (!profileUser) return;
        router.push(`/pay/confirm?userId=${profileUser.uid}&mode=request`);
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
             <header className="relative flex items-center mb-6">
                <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-xl font-semibold text-center w-full">個人檔案</h1>
            </header>
            
            <main>
                {isLoading && <ProfileSkeleton />}
                {error && (
                     <Card className="max-w-md mx-auto">
                        <CardContent className="p-6">
                             <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}
                {profileUser && (
                     <div className="flex flex-col items-center justify-center text-center space-y-4 pt-12">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                            <AvatarImage src={profileUser.photoURL} alt={`${profileUser.firstName} ${profileUser.lastName}`} />
                            <AvatarFallback className="text-5xl">{getInitials(profileUser.firstName)}</AvatarFallback>
                        </Avatar>
                         <div className="space-y-1">
                            <h2 className="text-3xl font-bold">{profileUser.firstName} {profileUser.lastName}</h2>
                            <p className="text-lg text-muted-foreground">{profileUser.username}</p>
                        </div>
                        <div className="w-full max-w-sm pt-4 space-y-3">
                            <Button onClick={handlePay} className="w-full h-14 text-lg">
                                <Send className="mr-2" />
                                付款
                            </Button>
                            <Button onClick={handleRequest} variant="secondary" className="w-full h-14 text-lg">
                                <Landmark className="mr-2" />
                                要求付款
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
