
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

export default function AppContent({ children }: { children: React.ReactNode }) {
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
    
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isWelcomePage = pathname.startsWith(welcomeRoute);
    const isPublicRoute = publicRoutes.some(route => pathname === route);

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

    }, [isAuthenticated, isLoading, pathname, router, userData, isAuthRoute, isWelcomePage, isPublicRoute]);
    
    if (isLoading && !isAuthRoute && !isPublicRoute) {
        return <AppLoader />;
    }

    if (isAuthRoute || isPublicRoute) {
        return <>{children}</>;
    }
    
    if (!isAuthenticated) {
      return null;
    }
    
    if (isWelcomePage) {
        return <>{children}</>;
    }

    const isFullScreenPage = fullScreenRoutes.some(route => pathname.startsWith(route));

     const handleConfirmIdle = () => {
        logout();
        setIsIdle(false);
    };

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
                    <BottomNav />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {isIdle && <IdleTimeoutDialog onConfirm={handleConfirmIdle} />}
            <DesktopNav />
            <main className="flex-1 p-8">
               <div className="mx-auto max-w-5xl">
                    {children}
               </div>
            </main>
        </div>
    );
}
