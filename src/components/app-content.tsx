
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
import { cn } from '@/lib/utils';


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
    
    const publicRoutes = ['/', '/terms', '/privacy'];
    const authRoutes = ['/login', '/signup', '/welcome'];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = authRoutes.includes(pathname);
    const isAppRoute = !isPublicRoute && !isAuthRoute;

    React.useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && isAppRoute) {
            router.push(`/login`);
        } else if (isAuthenticated) {
            if (userData && !userData.hasCompletedOnboarding && pathname !== '/welcome') {
                router.push(`/welcome`);
            } else if (userData && userData.hasCompletedOnboarding && (isAuthRoute || pathname === '/')) {
                router.push('/home');
            }
        }
    }, [isAuthenticated, isLoading, pathname, router, userData, isAppRoute, isAuthRoute]);
    
    // If the auth state is loading and we are on an app route, show the loader.
    if (isLoading && isAppRoute) {
        return <AppLoader />;
    }
    
    // This prevents a flash of the home page for unauthenticated users on app routes.
    if (!isAuthenticated && isAppRoute) {
      return <AppLoader />;
    }

    // This prevents a flash of the auth pages for authenticated users.
    if (isAuthenticated && isAuthRoute) {
        return <AppLoader />;
    }
    
    // Don't render a layout for public or auth routes.
    if (isPublicRoute || isAuthRoute) {
        return <>{children}</>;
    }

    // Wait for the mobile check to complete to prevent hydration mismatch.
    if (isMobile === undefined) {
        return <AppLoader />;
    }
    
    const fullScreenRoutes = ['/pay/confirm', '/pay/scan'];
    const isFullScreenPage = fullScreenRoutes.some(route => pathname.includes(route));

    const handleConfirmIdle = () => {
        logout();
        setIsIdle(false);
    };

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
               <div className="mx-auto max-w-7xl">
                    {children}
               </div>
            </main>
        </div>
    );
}
