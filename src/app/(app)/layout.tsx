import AppContent from '@/components/app-content';

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppContent>{children}</AppContent>;
}
