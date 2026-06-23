'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconAdd, IconTimeline } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Project } from '@/lib/api/api';
import { useCreateProject, useProjects } from '@/lib/hooks/use-projects';
import Image from 'next/image';

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
      <aside className="flex h-dvh w-[270px] shrink-0 flex-col border-r border-foreground/10 bg-app-bg px-5 py-6 text-foreground">
        <div className="flex w-full flex-col gap-8 border-b border-foreground/10 pb-5">
          <Link href="/tasks" className="w-fit">
            <div className="flex items-end gap-2">
              <Image src="/tM.svg" alt="Task Manager" width={30} height={30} />
              <span className="block text-lg font-semibold uppercase tracking-[0.18em] text-foreground">
                Task Manager
              </span>
            </div>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground/80">
              <IconTimeline className="h-5 w-5" />
              <h3 className="text-sm font-semibold">Projetos</h3>
            </div>
            <span className="rounded-md bg-foreground/5 px-2 py-1 text-xs text-foreground/45">
              {projects.length}
            </span>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col justify-between gap-6">
          <div className="flex min-h-0 flex-col gap-3">
            {isPending ? (
              <p className="rounded-lg bg-foreground/[0.03] px-3 py-2 text-sm text-foreground/45">
                Carregando projetos...
              </p>
            ) : (
              <>
                {isError ? (
                  <p className="rounded-lg border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-200">
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
                        className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-colors font-medium ${active
                          ? 'bg-foreground/10 text-foreground ring-1 ring-foreground/10'
                          : 'text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground'
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
              className="rounded-lg bg-foreground/5 text-sm text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
              onClick={openCreateModal}
            >
              <span className="flex items-center justify-center gap-2">
                <IconAdd className="h-4 w-4" />
                Novo projeto
              </span>
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            <ThemeToggle />
            <Button onClick={onLogout} variant="ghost" className="w-full justify-center rounded-lg py-2 text-sm">
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>

      <Dialog
        open={creating}
        onOpenChange={(open) => {
          if (!open && !createProject.isPending) closeCreateModal();
        }}
      >
        <DialogContent
          className="bg-app-bg p-5 sm:max-w-md"
          showCloseButton={!createProject.isPending}
          onEscapeKeyDown={(event) => {
            if (createProject.isPending) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (createProject.isPending) event.preventDefault();
          }}
        >
          <DialogHeader className="mb-1 gap-2">
            <DialogDescription className="text-xs font-medium uppercase tracking-[0.18em]">
              Criar projeto
            </DialogDescription>
            <DialogTitle className="text-xl font-semibold">Novo projeto</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreateSubmit}>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground/80">Nome</span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
                  placeholder="Nome do projeto"
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground/80">Descrição</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-28 resize-none rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-accent"
                  placeholder="Descrição do projeto"
                />
              </label>

              {createProject.isError ? (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
