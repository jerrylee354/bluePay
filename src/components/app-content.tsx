
"use client";

import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from './bottom-nav';
import DesktopNav from './desktop-nav';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { IdleTimeoutDialog } from './idle-timeout-dialog';
import { type Locale } from '../../i18n';
import { getDictionary, type Dictionary } from '@/dictionaries';

const authRoutes = ['/login', '/signup', '/terms', '/privacy'];
const fullScreenRoutes = ['/pay/confirm'];
const welcomeRoute = '/welcome';
const publicRoutes = ['/'];

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

export default function AppContent({ children, locale }: { children: React.ReactNode, locale: Locale }) {
    const { isAuthenticated, isLoading, userData, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    
    const [isIdle, setIsIdle] = useState(false);
    
    useEffect(() => {
        getDictionary(locale).then(setDictionary);
    }, [locale]);


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
    
    const isAuthRoute = authRoutes.some(route => pathname.endsWith(route));
    const isWelcomePage = pathname.endsWith(welcomeRoute);
    const isPublicRoute = publicRoutes.some(route => pathname === `/${locale}`);
    const isRoot = pathname === '/';


    useEffect(() => {
        if (isLoading || isRoot) return;
        
        const isAppRoute = !isAuthRoute && !isWelcomePage && !isPublicRoute;

        if (!isAuthenticated && isAppRoute) {
            router.push(`/${locale}/login`);
        } else if (isAuthenticated) {
            if (isPublicRoute) {
                router.push(`/${locale}/home`);
            } else if (userData && !userData.hasCompletedOnboarding && !isWelcomePage) {
                router.push(`/${locale}/welcome`);
            } else if (userData && userData.hasCompletedOnboarding && (isAuthRoute || isWelcomePage)) {
                router.push(`/${locale}/home`);
            }
        }

    }, [isAuthenticated, isLoading, pathname, router, userData, isAuthRoute, isWelcomePage, isPublicRoute, locale, isRoot]);
    
    if (isLoading && !isAuthRoute && !isPublicRoute) {
        return <AppLoader />;
    }

    if (isAuthRoute || isPublicRoute || isRoot) {
        return <>{children}</>;
    }
    
    if (!isAuthenticated) {
      return <AppLoader />;
    }
    
    if (isWelcomePage) {
        return <>{children}</>;
    }

    const isFullScreenPage = fullScreenRoutes.some(route => pathname.endsWith(route));

     const handleConfirmIdle = () => {
        logout();
        setIsIdle(false);
    };

    if (!dictionary) {
        return <AppLoader />;
    }

    if (isMobile && isFullScreenPage) {
         return (
            <main className="h-screen">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} />}
                {children}
            </main>
         );
    }

    if (isMobile) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} />}
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
            {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} />}
            <DesktopNav dictionary={dictionary.nav} settingsDictionary={dictionary.settings} />
            <main className="flex-1 p-8">
               <div className="mx-auto max-w-5xl">
                    {children}
               </div>
            </main>
        </div>
    );
}
