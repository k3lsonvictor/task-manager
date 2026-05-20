'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconDelete, IconTimeline } from '@/components/icons';
import type { Project } from '@/lib/api';

type Props = {
  projects: Project[];
  children: React.ReactNode;
};

export function AppShell({ projects, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  }

  return (
    <div className="flex min-h-dvh w-full bg-app-bg">
      <aside className="flex h-dvh w-[250px] shrink-0 flex-col bg-sidebar px-[30px] py-[30px] text-white">
        <div className="flex w-full flex-col gap-10 border-b-2 border-white/20 pb-2.5">
          <Image src="/imagem.png" alt="Task Manager" width={120} height={40} className="h-auto w-auto" />
          <div className="flex items-center gap-2">
            <IconTimeline />
            <h3 className="text-base font-normal">Projetos</h3>
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            {projects.map((project) => {
              const href = `/tasks/${project.id}`;
              const active = pathname === href;

              return (
                <div
                  key={project.id}
                  className={`group flex w-full items-center justify-between rounded-sm bg-project-item px-3 py-2 ${active ? 'ring-1 ring-accent/60' : ''}`}
                >
                  <Link href={href} className="text-sm">
                    {project.name}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Excluir ${project.name}`}
                    className="cursor-pointer border-none bg-transparent text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => router.push('/tasks')}
                  >
                    <IconDelete className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
            <Button fullWidth>Novo Projeto</Button>
          </div>

          <Button onClick={onLogout}>Logout</Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
