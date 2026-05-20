import { IconAdd, IconEdit } from '@/components/icons';
import { StepColumn } from '@/components/kanban/step-column';
import { Button } from '@/components/ui/button';
import { fetchProject } from '@/lib/api';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ projectId: string }> };

const DEMO_STEPS = [
  {
    name: 'A Fazer',
    tasks: [
      { id: '1', title: 'Estudar conceitos de SOLID', tag: 'Dev' },
      { id: '2', title: 'Entrevista técnica' },
    ],
  },
  {
    name: 'Em Andamento',
    tasks: [{ id: '3', title: 'Estudar Nest', tag: 'Backend' }],
  },
  {
    name: 'Concluído',
    tasks: [{ id: '4', title: 'Fazer projeto' }],
  },
];

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const project = await fetchProject(projectId).catch(() => null);

  if (!project) notFound();

  return (
    <main className="flex h-full w-full flex-col p-[30px]">
      <div className="mb-6 flex flex-col">
        <header className="gradient-project-header mb-0 flex w-full items-center justify-between gap-1.5 rounded-t-md border-none px-[30px] py-5 pb-4 text-sm text-white">
          <div className="flex w-full flex-col gap-2.5">
            <div
              className={`container-project-title flex gap-5 pb-2 ${project.description ? 'border-b border-white' : ''}`}
            >
              <h1 className="text-[30px] font-semibold">{project.name}</h1>
              <button
                type="button"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-white/[0.178] text-white"
                aria-label="Editar projeto"
              >
                <IconEdit />
              </button>
            </div>
            {project.description ? <p>{project.description}</p> : null}
          </div>
        </header>

        <div className="rounded-b-md border-none bg-[rgba(65,65,65,0.3)]">
          <div className="flex w-full items-center gap-2 px-[30px] py-3 text-sm text-white">
            <span>Tags:</span>
            <button
              type="button"
              className="cursor-pointer rounded-full p-1 transition-colors hover:bg-accent"
              aria-label="Adicionar tag"
            >
              <IconAdd className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <Button fullWidth={false} className="!w-auto">
        <span className="flex items-center justify-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-accent">
            <IconAdd className="h-4 w-4" />
          </span>
          Nova Etapa
        </span>
      </Button>

      <div className="scrollbar-thin mt-4 flex h-full w-full gap-2.5 overflow-x-auto pb-2.5">
        {DEMO_STEPS.map((step) => (
          <StepColumn key={step.name} name={step.name} tasks={step.tasks} />
        ))}
      </div>
    </main>
  );
}
