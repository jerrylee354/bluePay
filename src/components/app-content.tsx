

"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/auth-context';
import BottomNav from './bottom-nav';
import DesktopNav from './desktop-nav';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { IdleTimeoutDialog } from './idle-timeout-dialog';
import { type Dictionary } from '@/dictionaries';
import { Skeleton } from './ui/skeleton';
import { LoadingOverlay } from './ui/loading-overlay';
import { Toaster } from './ui/toaster';
import { LockScreenDialog } from './lock-screen-dialog';
import { AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';


const AppLoader = () => (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 p-4">
             <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
             </div>
             <Skeleton className="h-32 w-full rounded-xl" />
             <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-20 w-full rounded-xl" />
             </div>
        </div>
    </div>
);

const AnimatedCheckmark = () => (
    <div className="mx-auto my-4 h-[80px] w-[80px]">
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
    </div>
);

const AccountSuspendedScreen = ({ dictionary, onLogout, onAppeal, hasAppealed }: { dictionary: Dictionary['accountSuspended'], onLogout: () => void, onAppeal: () => void, hasAppealed: boolean }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                       {!hasAppealed && <AlertTriangle className="h-10 w-10 text-destructive" />}
                    </div>
                     <CardTitle className="mt-4 text-2xl font-bold">{hasAppealed ? dictionary.appealSuccessTitle : dictionary.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {hasAppealed ? (
                        <div className="flex flex-col items-center">
                            <AnimatedCheckmark />
                            <p className="text-muted-foreground">{dictionary.appealSuccessDescription}</p>
                            <Button variant="outline" className="w-full mt-6" onClick={onLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                {dictionary.logout}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted-foreground">{dictionary.description}</p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button variant="outline" className="w-full" onClick={onLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {dictionary.logout}
                                </Button>
                                <Button className="w-full" onClick={onAppeal}>
                                    {dictionary.appeal}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
};


function AuthDependentContent({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    const { user, isAuthenticated, isLoading, logout, isLoggingOut, userData, submitAppeal } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [isIdle, setIsIdle] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const { toast } = useToast();

    const isBusiness = userData?.accountType === 'business';
    
    const handleIdle = () => {
        if(isAuthenticated) {
            if (isBusiness) {
                setIsLocked(true);
            } else {
                logout({ redirect: false });
                setIsIdle(true);
            }
        }
    };
    
    useIdleTimeout({
        onIdle: handleIdle,
        idleTimeout: isBusiness ? 60000 : 180000, // 1 minute for business, 3 minutes for personal
    });
    
    const localeSegment = `/${dictionary.locale}`;
    const publicPaths = ['/', '/terms', '/privacy', '/login', '/signup', '/welcome'].map(p => {
        // The root path in a multi-lang setup is just the locale itself
        if (p === '/') {
            return `/${dictionary.locale}`;
        }
        return `${localeSegment}${p}`;
    });
    const isPublicRoute = publicPaths.includes(pathname);

    if (isPublicRoute) {
        return <>{children}</>;
    }
    
    if (isLoading || isMobile === undefined || (isLoggingOut && !isIdle)) {
      return (
        <div className="min-h-screen bg-background">
            <LoadingOverlay isLoading={true} />
        </div>
      );
    }

    const handleAppeal = async () => {
        if (!user) return;
        try {
            await submitAppeal(user.uid);
            toast({
                title: dictionary.accountSuspended.appealSuccessTitle,
                description: dictionary.accountSuspended.appealSuccessDescription,
            });
        } catch (error) {
            // Handle error, maybe show a toast
            toast({
                variant: 'destructive',
                title: "Appeal Failed",
                description: "Could not submit appeal. Please try again later."
            })
        }
    };
    
    if (userData?.status === 'No') {
        return <AccountSuspendedScreen 
                    dictionary={dictionary.accountSuspended} 
                    onLogout={logout}
                    onAppeal={handleAppeal}
                    hasAppealed={userData?.hasAppealed === true}
                />
    }
    
    const fullScreenRoutes = ['/pay/confirm', '/pay/scan'];
    const isFullScreenPage = fullScreenRoutes.some(route => pathname.includes(route));

    const handleConfirmIdle = () => {
        setIsIdle(false); // Close dialog
        router.push(`/${dictionary.locale}/login`);
    };

    const handleUnlock = () => {
        setIsLocked(false);
    }

    if (isLocked) {
        return <LockScreenDialog onConfirm={handleUnlock} dictionary={dictionary.lockScreen} />;
    }

    if (isMobile && isFullScreenPage) {
         return (
            <main className="h-dvh bg-background">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                {children}
            </main>
         );
    }

    if (isMobile) {
        return (
            <div className="relative flex min-h-dvh w-full flex-col items-center">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                <div className="w-full max-w-lg bg-background flex-1 flex flex-col">
                    <main className="flex-1 overflow-y-auto p-4 pb-28">
                        {children}
                    </main>
                </div>
                 <BottomNav dictionary={dictionary.nav} /> {/* Moved BottomNav out of the flex-col container */}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
            <DesktopNav dictionary={dictionary.nav} settingsDictionary={dictionary} />
            <main className="flex-1 p-8">
               <div className="mx-auto max-w-7xl">
                    {children}
               </div>
            </main>
        </div>
    );
}


export default function AppContent({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    return (
        <AuthProvider>
            <AuthDependentContent dictionary={dictionary}>
                {children}
            </AuthDependentContent>
            <Toaster />
        </AuthProvider>
    );
}
