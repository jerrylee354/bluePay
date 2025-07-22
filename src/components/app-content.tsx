
"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import BottomNav from './bottom-nav';
import DesktopNav from './desktop-nav';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { IdleTimeoutDialog } from './idle-timeout-dialog';
import { type Dictionary } from '@/dictionaries';


export default function AppContent({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
    const { isAuthenticated, isLoading, logout } = useAuth();
    const pathname = usePathname();
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
    const authRoutes = ['/login', 'signup', '/welcome'];
    const isPublicRoute = publicRoutes.includes(pathname) || authRoutes.some(p => pathname.includes(p));

    // If the page is public, don't render any specific app layout.
    if (isPublicRoute) {
        return <>{children}</>;
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

