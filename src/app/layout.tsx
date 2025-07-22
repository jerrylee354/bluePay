import React from 'react';
import AppContent from '@/components/app-content';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { getDictionary } from '@/dictionaries';
import { i18n, type Locale } from '@/i18n';

// This RootLayout is now simpler and doesn't fetch data itself.
// The locale-based layouts will handle data fetching.
export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  return (
    <html lang={params.lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico?favicon.56766c03.ico" sizes="48x48" type="image/x-icon" />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
