'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconAdd, IconTimeline } from '@/components/icons';
import { Modal } from '@/components/ui/modal';
import type { Project } from '@/lib/api/api';
import { useCreateProject, useProjects } from '@/lib/hooks/use-projects';

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isPending, isError } = useProjects();
  const createProject = useCreateProject();
  const projects: Project[] = data ?? [];
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  async function onLogout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/login');
    router.refresh();
  }

  function openCreateModal() {
    setName('');
    setDescription('');
    createProject.reset();
    setCreating(true);
  }

  function closeCreateModal() {
    setCreating(false);
    createProject.reset();
  }

  function onCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = name.trim();
    const nextDescription = description.trim();

    if (!nextName) return;

    createProject.mutate(
      {
        name: nextName,
        description: nextDescription || undefined,
      },
      {
        onSuccess(project) {
          setCreating(false);
          router.push(`/tasks/${project.id}`);
        },
      }
    );
  }

  return (
    <div className="flex min-h-dvh w-full bg-app-bg">
      <aside className="flex h-dvh w-[270px] shrink-0 flex-col border-r border-white/10 bg-app-bg px-5 py-6 text-white">
        <div className="flex w-full flex-col gap-8 border-b border-white/10 pb-5">
          <Link href="/tasks" className="w-fit">
            <span className="block text-lg font-semibold uppercase tracking-[0.18em] text-white">
              Task Manager
            </span>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <IconTimeline className="h-5 w-5" />
              <h3 className="text-sm font-semibold">Projetos</h3>
            </div>
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/45">
              {projects.length}
            </span>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col justify-between gap-6">
          <div className="flex min-h-0 flex-col gap-3">
            {isPending ? (
              <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-white/45">
                Carregando projetos...
              </p>
            ) : (
              <>
                {isError ? (
                  <p className="rounded-lg border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs leading-relaxed text-amber-200/90">
                    Não foi possível carregar os projetos.
                  </p>
                ) : null}
                <nav className="scrollbar-thin flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
                  {projects.map((project) => {
                    const href = `/tasks/${project.id}`;
                    const active = pathname === href;

                    return (
                      <Link
                        href={href}
                        key={project.id}
                        className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? 'bg-white/10 text-white ring-1 ring-white/10'
                            : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{project.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </>
            )}
            <Button
              fullWidth
              className="rounded-lg !bg-white/5 text-sm !text-white/80 hover:!bg-white/10 hover:!text-white"
              onClick={openCreateModal}
            >
              <span className="flex items-center justify-center gap-2">
                <IconAdd className="h-4 w-4" />
                Novo projeto
              </span>
            </Button>
          </div>

          <Button onClick={onLogout} variant="ghost" className="w-full justify-center rounded-lg py-2 text-sm">
            Logout
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>

      <Modal
        open={creating}
        title="Novo projeto"
        description="Criar projeto"
        onClose={closeCreateModal}
        closeOnBackdrop={!createProject.isPending}
        closeOnEscape={!createProject.isPending}
      >
        <form onSubmit={onCreateSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Nome</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Nome do projeto"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Descrição</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-28 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Descrição do projeto"
              />
            </label>

            {createProject.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {createProject.error.message}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              className="rounded-lg px-4 text-sm"
              onClick={closeCreateModal}
              disabled={createProject.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              className="!w-auto rounded-lg px-4 text-sm"
              disabled={createProject.isPending || !name.trim()}
            >
              {createProject.isPending ? 'Criando...' : 'Criar projeto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
