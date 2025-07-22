
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider as FirebaseAuthProvider, useAuth as useFirebaseAuth } from '@/context/auth-context';
import BottomNav from './bottom-nav';
import DesktopNav from './desktop-nav';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import { IdleTimeoutDialog } from './idle-timeout-dialog';
import { type Locale } from '../i18n';
import { getDictionary, type Dictionary } from '@/dictionaries';
import { i18n } from '../i18n';

const authRoutes = ['/login', '/signup', '/terms', '/privacy', '/welcome'];
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

function AppContentInternal({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, userData, logout } = useFirebaseAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    const [isIdle, setIsIdle] = useState(false);
    
    const locale = i18n.locales.find(l => pathname.startsWith(`/${l}`)) || i18n.defaultLocale;

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
    const isPublicRoute = pathname === `/` || i18n.locales.every(l => !pathname.startsWith(`/${l}`));


    useEffect(() => {
        if (isLoading) return;
        
        const isAppRoute = !isAuthRoute && !isPublicRoute;

        if (!isAuthenticated && isAppRoute) {
            router.push(`/${locale}/login`);
        } else if (isAuthenticated) {
            if (isPublicRoute) {
                 router.push(`/${locale}/home`);
            } else if (userData && !userData.hasCompletedOnboarding && !pathname.endsWith('/welcome')) {
                router.push(`/${locale}/welcome`);
            } else if (userData && userData.hasCompletedOnboarding && (isAuthRoute && !pathname.endsWith('/privacy') && !pathname.endsWith('/terms'))) {
                router.push(`/${locale}/home`);
            }
        }
    }, [isAuthenticated, isLoading, pathname, router, userData, isAuthRoute, isPublicRoute, locale]);
    
    if (isLoading && !isAuthRoute && !isPublicRoute) {
        return <AppLoader />;
    }

    if (isPublicRoute) {
        return <>{children}</>
    }
    
    // Auth routes (login, signup) and welcome page
    if (isAuthRoute) {
        if(dictionary){
            const pageName = pathname.substring(pathname.lastIndexOf('/') + 1) as keyof Dictionary;
             const childrenWithProps = React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  // @ts-ignore
                  return React.cloneElement(child, { dictionary: dictionary[pageName] || dictionary.login });
                }
                return child;
              });
              return <>{childrenWithProps}</>;
        }
        return <AppLoader/>
    }
    
    if (!isAuthenticated) {
      return <AppLoader />;
    }

    const isFullScreenPage = fullScreenRoutes.some(route => pathname.endsWith(route));

     const handleConfirmIdle = () => {
        logout();
        setIsIdle(false);
    };

    if (!dictionary) {
        return <AppLoader />;
    }
    
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { dictionary });
        }
        return child;
    });

    if (isMobile && isFullScreenPage) {
         return (
            <main className="h-screen bg-background">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                {childrenWithProps}
            </main>
         );
    }

    if (isMobile) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center">
                {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} dictionary={dictionary.idleTimeout}/>}
                <div className="w-full max-w-lg bg-background h-screen flex flex-col">
                    <main className="flex-1 overflow-y-auto p-4 mb-24">
                        {childrenWithProps}
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
                    {childrenWithProps}
               </div>
            </main>
        </div>
    );
}

export default function AppContent({ children }: { children: React.ReactNode }) {
    // This component no longer needs AuthProvider
    return (
        <AppContentInternal>
            {children}
        </AppContentInternal>
    )
}
