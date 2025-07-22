
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
import { type Locale } from '../../i18n';
import { getDictionary, type Dictionary } from '@/dictionaries';

const authRoutes = ['/login', '/signup', '/terms', '/privacy'];
const fullScreenRoutes = ['/pay/confirm'];
const welcomeRoute = '/welcome';
const publicRoute = '/';


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

function AppContentInternal({ children, locale }: { children: React.ReactNode, locale: Locale }) {
    const { isAuthenticated, isLoading, userData, logout } = useFirebaseAuth();
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
    const isPublicRoute = pathname === `/${locale}` || pathname === '/';


    useEffect(() => {
        if (isLoading) return;
        
        const isAppRoute = !isAuthRoute && !isWelcomePage && !isPublicRoute;

        if (!isAuthenticated && isAppRoute) {
            router.push('/login');
        } else if (isAuthenticated) {
            if (isPublicRoute) {
                router.push('/home');
            } else if (userData && !userData.hasCompletedOnboarding && !isWelcomePage) {
                router.push('/welcome');
            } else if (userData && userData.hasCompletedOnboarding && (isAuthRoute || isWelcomePage)) {
                router.push('/home');
            }
        }
    }, [isAuthenticated, isLoading, pathname, router, userData, isAuthRoute, isWelcomePage, isPublicRoute, locale]);
    
    if (isLoading && !isAuthRoute && !isPublicRoute) {
        return <AppLoader />;
    }

    if (isAuthRoute || isPublicRoute) {
        if(dictionary){
             const childrenWithProps = React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                  // @ts-ignore
                  return React.cloneElement(child, { dictionary: dictionary[isAuthRoute ? 'login' : 'landing'] });
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

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            if (child.type.name.includes('Page')) {
                 const pageName = child.type.name.replace('Page', '').toLowerCase();
                 // @ts-ignore
                 const pageDictionary = dictionary[pageName];
                 if (pageDictionary) {
                    // @ts-ignore
                    return React.cloneElement(child, { dictionary: pageDictionary });
                 }
            }
        }
        return child;
    });

    if (isMobile && isFullScreenPage) {
         return (
            <main className="h-screen">
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

export default function AppContent({ children, locale }: { children: React.ReactNode, locale: Locale }) {
    return (
        <FirebaseAuthProvider>
            <AppContentInternal locale={locale}>
                {children}
            </AppContentInternal>
        </FirebaseAuthProvider>
    )
}
