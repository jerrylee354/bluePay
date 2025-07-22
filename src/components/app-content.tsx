
"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import BottomNav from './bottom-nav';
import DesktopNav from './desktop-nav';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { IdleTimeoutDialog } from './idle-timeout-dialog';
import { type Dictionary } from '@/dictionaries';

const authRoutes = ['/login', '/signup'];
const publicRoutes = ['/', '/terms', '/privacy'];
const fullScreenRoutes = ['/pay/confirm', '/pay/scan'];


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
            <Skeleton className="h-28 w-full rounded-xl" />
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    </div>
);

export default function AppContent({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    const { isAuthenticated, isLoading, userData, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [isIdle, setIsIdle] = useState(false);
    
    const handleIdle = () => {
        if(isAuthenticated) {
            setIsIdle(true);
        }
    };

    useIdleTimeout({
        onIdle: handleIdle,
        activeTimeout: 180000, // 3 minutes
        inactiveTimeout: 120000, // 2 minutes
        isIdle: !isAuthenticated || isLoading,
    });
    
    const isAuthRoute = authRoutes.some(route => pathname === route);
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAppRoute = !isAuthRoute && !isPublicRoute;

    React.useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && isAppRoute) {
            router.push(`/login`);
        } else if (isAuthenticated) {
             if (isPublicRoute && pathname !== '/') { // Allow landing page for logged in users, but redirect from other public pages
                 router.push(`/home`);
            } else if (userData && !userData.hasCompletedOnboarding && pathname !== '/welcome') {
                router.push(`/welcome`);
            } else if (userData && userData.hasCompletedOnboarding && pathname === '/welcome') {
                router.push('/home');
            } else if (isAuthRoute) {
                 router.push(`/home`);
            }
        }
    }, [isAuthenticated, isLoading, pathname, router, userData, isAppRoute, isPublicRoute, isAuthRoute]);
    
    if (isLoading && isAppRoute) {
        return <AppLoader />;
    }
    
    if (!isAuthenticated && isAppRoute) {
      return <AppLoader />;
    }

    const isFullScreenPage = fullScreenRoutes.some(route => pathname.includes(route));

     const handleConfirmIdle = () => {
        logout();
        setIsIdle(false);
    };
    
    const pageKey = pathname.split('/')[1] || 'landing';
    
    // Public routes and auth routes are rendered without the app shell
    if (isPublicRoute || isAuthRoute || pathname === '/welcome') {
        return <>{children}</>;
    }


    if (isMobile && isFullScreenPage) {
         return (
            <main className="h-screen bg-background">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                {children}
            </main>
         );
    }

    if (isMobile) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                <div className="w-full max-w-lg bg-background h-screen flex flex-col">
                    <main className="flex-1 overflow-y-auto p-4 mb-24">
                        {children}
                    </main>
                    <BottomNav dictionary={dictionary.nav} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
            <DesktopNav dictionary={dictionary.nav} settingsDictionary={dictionary.settings} />
            <main className="flex-1 p-8">
               <div className="mx-auto max-w-5xl">
                    {children}
               </div>
            </main>
        </div>
    );
}
