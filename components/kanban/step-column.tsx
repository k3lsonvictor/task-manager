import { IconAdd } from '@/components/icons';
import { TaskCard } from '@/components/kanban/task-card';

type Task = { id: string; title: string; tag?: string };

type Props = {
  name: string;
  tasks: Task[];
};

export function StepColumn({ name, tasks }: Props) {
  return (
    <section className="flex h-full max-h-[calc(100dvh-220px)] w-[300px] shrink-0 flex-col gap-5 overflow-y-auto rounded-xl bg-auth-bg px-5 py-2.5 text-white/50 scrollbar-thin">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">{name}</h3>
        <button
          type="button"
          className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white"
          aria-label="Adicionar tarefa"
        >
          <IconAdd />
        </button>
      </header>
      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} title={task.title} tag={task.tag} />
        ))}
      </div>
    </section>
  );
}
