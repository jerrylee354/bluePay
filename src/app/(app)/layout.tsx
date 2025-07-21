import AppContent from '@/components/app-content';
import { AuthProvider } from '@/context/auth-context';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
