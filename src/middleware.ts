
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
  const locale = getLocale(request);
  const token = request.cookies.get('firebaseIdToken');

  // Add locale to the path if it's missing
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  const authenticatedRoutes = ['/home', '/activity', '/pay', '/wallet', '/settings'];
  const authRoutes = ['/login', '/signup', '/welcome'];

  // Check if the current route requires authentication
  const isProtectedRoute = authenticatedRoutes.some(route => pathname.endsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.endsWith(route));

  if (token) {
    // If logged in, redirect from auth pages to home
    if (isAuthRoute || pathname === `/${locale}` || pathname === `/${locale}/`) {
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  } else {
    // If not logged in, redirect protected routes to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
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
