
import { getDictionary } from '@/dictionaries';
import { type Locale } from '../i18n';
import AppContent from '@/components/app-content';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { i18n } from '../i18n';

// This is the new root layout. It no longer has language params.
// It immediately renders AuthProvider and AppContent which will handle everything else.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
