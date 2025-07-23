

"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DocumentData } from 'firebase/firestore';
import VerificationStatusDialog from './VerificationStatusDialog';


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

const AccountSuspendedScreen = ({ 
    dictionary, 
    onLogout, 
    onAppeal, 
    userData,
    onContinue,
    showAppealSuccess,
}: { 
    dictionary: Dictionary['accountSuspended'],
    onLogout: () => void, 
    onAppeal: () => void, 
    userData: DocumentData | null,
    onContinue: () => void,
    showAppealSuccess: boolean,
}) => {
    // Defensive check: Do not render if the dictionary is not yet loaded.
    if (!dictionary) {
        return <div />;
    }
    
    const d = dictionary;
    const [showTemporarySuccess, setShowTemporarySuccess] = useState(false);

    const handleAppealClick = () => {
        onAppeal();
        setShowTemporarySuccess(true);
        setTimeout(() => {
            setShowTemporarySuccess(false);
        }, 2000);
    }
    
    const getSuspensionDetails = () => {
        switch (userData?.status) {
            case 'No1':
                return { title: d.title, description: d.description_large_transaction };
            case 'No2':
                return { title: d.title, description: d.description_fraud };
            default:
                return { title: d.title, description: d.description };
        }
    }

    if (showAppealSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                        <CardTitle className="mt-4 text-2xl font-bold">{d.appealApprovedTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center">
                            <AnimatedCheckmark />
                            <p className="text-muted-foreground">{d.appealApprovedDescription}</p>
                            <Button className="w-full mt-6" onClick={onContinue}>
                                {d.continue}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (showTemporarySuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
                <Card className="w-full max-w-md text-center shadow-lg">
                    <CardHeader>
                         <CardTitle className="mt-4 text-2xl font-bold">{d.appealSuccessTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex flex-col items-center">
                            <AnimatedCheckmark />
                            <p className="text-muted-foreground">{d.appealSuccessDescription}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { title, description } = getSuspensionDetails();
    const hasAppealed = userData?.hasAppealed || false;

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                       <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                     <CardTitle className="mt-4 text-2xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground">{hasAppealed ? d.appealInReview : description}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" className="w-full" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            {d.logout}
                        </Button>
                        {!hasAppealed && (
                            <Button className="w-full" onClick={handleAppealClick}>
                                {d.appeal}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
};


function AuthDependentContent({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    const { isAuthenticated, logout, userData } = useAuth();
    const isMobile = useIsMobile();
    const [isIdle, setIsIdle] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

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
        idleTimeout: isBusiness ? 60000 : 180000, 
    });

    const handleConfirmIdle = () => {
        setIsIdle(false);
        const localeSegment = `/${dictionary.locale}`;
        const router = useRouter();
        router.push(`${localeSegment}/login`);
    };

    const handleUnlock = () => {
        setIsLocked(false);
    }

    if (isLocked) {
        return <LockScreenDialog onConfirm={handleUnlock} dictionary={dictionary.lockScreen} />;
    }

    const pathname = usePathname();
    const fullScreenRoutes = ['/pay/confirm', '/pay/scan'];
    const isFullScreenPage = fullScreenRoutes.some(route => pathname.includes(route));

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
             <div className="relative flex min-h-dvh w-full flex-col">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                <div className="w-full max-w-lg mx-auto bg-background flex-1 flex flex-col">
                    <main className="flex-1 overflow-y-auto p-4 pb-28">
                        {children}
                    </main>
                </div>
                 <BottomNav dictionary={dictionary.nav} />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
            <DesktopNav dictionary={dictionary.nav} settingsDictionary={dictionary} />
            <div className="flex-1 overflow-y-auto">
                <main className="p-8">
                   <div className="mx-auto max-w-7xl">
                        {children}
                   </div>
                </main>
            </div>
        </div>
    );
}

function AppContentWithAuth({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    const { user, userData, isLoading, isLoggingOut, logout, submitAppeal, lastVerificationStatus } = useAuth();
    const pathname = usePathname();

    const [showAppealSuccessScreen, setShowAppealSuccessScreen] = useState(false);
    const prevUserDataRef = useRef<DocumentData | null>();
    const { toast } = useToast();

    const [showVerificationDialog, setShowVerificationDialog] = useState(false);
    const [verificationChangeType, setVerificationChangeType] = useState<'granted' | 'revoked' | null>(null);

    useEffect(() => {
        if (lastVerificationStatus === 'No' && userData?.verify === 'Yes') {
            setVerificationChangeType('granted');
            setShowVerificationDialog(true);
        } else if (lastVerificationStatus === 'Yes' && userData?.verify === 'No') {
            setVerificationChangeType('revoked');
            setShowVerificationDialog(true);
        }
    }, [userData?.verify, lastVerificationStatus]);

    useEffect(() => {
        if (prevUserDataRef.current && (prevUserDataRef.current.status !== 'Yes' && userData?.status === 'Yes')) {
             setShowAppealSuccessScreen(true);
        }
        prevUserDataRef.current = userData;
    }, [userData]);

    const handleAppeal = async () => {
        if (!user) return;
        try {
            await submitAppeal(user.uid);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Appeal Failed",
                description: "Could not submit appeal. Please try again later."
            })
        }
    };
    
    const localeSegment = `/${dictionary.locale}`;
    const publicPaths = ['/', '/terms', '/privacy', '/login', '/signup', '/welcome'].map(p => {
        if (p === '/') return `/${dictionary.locale}`;
        return `${localeSegment}${p}`;
    });
    const isPublicRoute = publicPaths.includes(pathname);

    if (isPublicRoute) {
        return <>{children}</>;
    }
    
    if (isLoading || (isLoggingOut && !pathname.includes('/login'))) {
        return <LoadingOverlay isLoading={true} />;
    }
    
    if (showAppealSuccessScreen) {
        return <AccountSuspendedScreen
                    dictionary={dictionary.accountSuspended}
                    onLogout={logout}
                    onAppeal={handleAppeal}
                    userData={userData}
                    onContinue={() => setShowAppealSuccessScreen(false)}
                    showAppealSuccess={true}
                />
    }

    if (userData && userData.status !== 'Yes') {
        return <AccountSuspendedScreen 
                    dictionary={dictionary.accountSuspended} 
                    onLogout={logout}
                    onAppeal={handleAppeal}
                    userData={userData}
                    onContinue={() => {}} // This path is not used when showAppealSuccess is false
                    showAppealSuccess={false}
                />
    }

    return (
        <>
            <AuthDependentContent dictionary={dictionary}>
                {children}
            </AuthDependentContent>
            {showVerificationDialog && verificationChangeType && (
                <VerificationStatusDialog
                    user={userData}
                    type={verificationChangeType}
                    onClose={() => setShowVerificationDialog(false)}
                    dictionary={dictionary.verificationStatus}
                />
            )}
        </>
    );
}


export default function AppContent({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    return (
        <AuthProvider>
            <AppContentWithAuth dictionary={dictionary}>
                {children}
            </AppContentWithAuth>
            <Toaster />
        </AuthProvider>
    );
}
