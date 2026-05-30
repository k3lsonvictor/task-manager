import { IconAdd, IconEdit } from '@/components/icons';
import { TaskCard } from '@/components/kanban/task-card';
import type { Task } from '@/lib/api/api';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  activeTaskId?: string | null;
  name: string;
  onAddTask: () => void;
  onEditStep: () => void;
  onOpenTask: (task: Task) => void;
  stepId: string;
  tasks: Task[];
};

type SortableTaskCardProps = {
  active: boolean;
  onOpenTask: (task: Task) => void;
  stepId: string;
  task: Task;
};

function SortableTaskCard({ active, onOpenTask, stepId, task }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    data: {
      stepId,
      taskId: task.id,
      type: 'task',
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`cursor-grab touch-none transition-opacity active:cursor-grabbing ${
        active ? 'opacity-45' : 'opacity-100'
      }`}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        name={task.name}
        description={task.description}
        onClick={() => onOpenTask(task)}
        position={task.position}
      />
    </div>
  );
}

export function StepColumn({
  activeTaskId,
  name,
  onAddTask,
  onEditStep,
  onOpenTask,
  stepId,
  tasks,
}: Props) {
  const { setNodeRef } = useDroppable({
    id: `step:${stepId}`,
    data: {
      stepId,
      type: 'step',
    },
  });

  return (
    <section className="flex h-full max-h-[calc(100dvh-220px)] w-[300px] shrink-0 flex-col gap-5 overflow-y-auto rounded-xl bg-auth-bg px-5 py-2.5 text-white/50 scrollbar-thin">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">{name}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white/15"
            aria-label="Editar etapa"
            onClick={onEditStep}
          >
            <IconEdit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white transition-colors hover:bg-white/15"
            aria-label="Adicionar tarefa"
            onClick={onAddTask}
          >
            <IconAdd />
          </button>
        </div>
      </header>
      <div
        ref={setNodeRef}
        className="flex min-h-[240px] flex-1 flex-col gap-2 rounded-lg"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              active={activeTaskId === task.id}
              onOpenTask={onOpenTask}
              stepId={stepId}
              task={task}
            />
          ))}
        </SortableContext>
      </div>
    </section>
  );
}
