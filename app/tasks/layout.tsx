import { AppShell } from '@/components/layout/app-shell';
import { fetchProjects } from '@/lib/api';

export default async function TasksLayout({ children }: { children: React.ReactNode }) {
  const projects = await fetchProjects().catch(() => []);

  return <AppShell projects={projects}>{children}</AppShell>;
}
