
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  const locale = matchLocale(languages, locales, i18n.defaultLocale);
  return locale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is for a file/asset
  const isAsset = pathname.includes('.') || pathname.startsWith('/api') || pathname.startsWith('/_next');
  if (isAsset) {
    return NextResponse.next();
  }

  // Check if the path is missing a locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  const locale = getLocale(request);

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  const token = request.cookies.get('firebaseIdToken');
  const localeFromPath = pathname.split('/')[1];

  const authenticatedRoutes = ['/home', '/activity', '/pay', '/wallet', '/settings', '/pay/confirm', '/pay/request', '/pay/scan'];
  const authRoutes = ['/login', '/signup', '/welcome'];

  const isProtectedRoute = authenticatedRoutes.some(route => pathname.startsWith(`/${localeFromPath}${route}`));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(`/${localeFromPath}${route}`));
  const isRootPage = pathname === `/${localeFromPath}` || pathname === `/${localeFromPath}/`;

  if (token) {
    // If logged in, redirect from auth pages or root to home
    if (isAuthRoute || isRootPage) {
      return NextResponse.redirect(new URL(`/${localeFromPath}/home`, request.url));
    }
  } else {
    // If not logged in, redirect protected routes to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL(`/${localeFromPath}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and API routes
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};
