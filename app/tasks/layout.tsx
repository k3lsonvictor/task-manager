import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppShell } from '@/components/layout/app-shell';

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
