
"use client";

import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BottomNav from './bottom-nav';
import DesktopNav from './desktop-nav';
import { Skeleton } from './ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';

const authRoutes = ['/login', '/signup', '/terms', '/privacy'];
const fullScreenRoutes = ['/pay/confirm'];

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
    const { isAuthenticated, isLoading, userData } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isMobile = useIsMobile();
    
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !isAuthRoute) {
            router.push('/login');
        } else if (isAuthenticated) {
            if (userData && userData.hasCompletedOnboarding === false && pathname !== '/welcome') {
                router.push('/welcome');
            } else if (userData && userData.hasCompletedOnboarding === true && (isAuthRoute || pathname === '/welcome')) {
                router.push('/');
            }
        }

    }, [isAuthenticated, isLoading, pathname, router, userData, isAuthRoute]);
    
    // While loading, or if we are not authenticated and not on an auth route, show the loader.
    if (isLoading || (!isAuthenticated && !isAuthRoute)) {
        return <AppLoader />;
    }
    
    const isWelcomePage = pathname.startsWith('/welcome');
    const isFullScreenPage = fullScreenRoutes.some(route => pathname.startsWith(route));

    // Render children directly for auth pages, welcome page, or if user is authenticated but data is not yet available
    if (isAuthRoute || isWelcomePage || !userData) {
        return <main className="h-screen">{children}</main>;
    }
    
    if (isMobile && isFullScreenPage) {
         return <main className="h-screen">{children}</main>;
    }

    if (isMobile) {
        return (
            <div className="relative flex min-h-screen w-full flex-col items-center">
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
            <DesktopNav />
            <main className="flex-1 p-8">
               <div className="mx-auto max-w-5xl">
                    {children}
               </div>
            </main>
        </div>
    );
}
