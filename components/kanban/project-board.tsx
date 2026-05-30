'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconAdd, IconDelete, IconEdit } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StepColumn } from '@/components/kanban/step-column';
import type { Step, Task } from '@/lib/api/api';
import { useProject, useUpdateProject } from '@/lib/hooks/use-projects';
import { useCreateStep, useDeleteStep, useSteps, useUpdateSteps } from '@/lib/hooks/use-steps';
import { useCreateTask, useReorderTasks, useTasks, useUpdateTask } from '@/lib/hooks/use-tasks';
import { reorderTasksByDrop } from '@/lib/kanban/reorder-tasks';
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';


type Props = { projectId: string };

type DndItemData = {
  stepId?: string;
  taskId?: string;
  type?: 'step' | 'task';
};

function getDropTarget(event: DragEndEvent): { stepId: string; taskId?: string } | null {
  if (!event.over) return null;

  const data = event.over.data.current as DndItemData | undefined;

  if (data?.type === 'step' && data.stepId) {
    return { stepId: data.stepId };
  }

  if (data?.type === 'task' && data.stepId && data.taskId) {
    return {
      stepId: data.stepId,
      taskId: data.taskId,
    };
  }

  return null;
}

function getChangedTaskPlacements(currentTasks: Task[], nextTasks: Task[]) {
  const currentTasksById = new Map(currentTasks.map((task) => [task.id, task]));

  return nextTasks.filter((task) => {
    const currentTask = currentTasksById.get(task.id);

    return currentTask?.position !== task.position || currentTask?.stepId !== task.stepId;
  });
}

export function ProjectBoard({ projectId }: Props) {
  const { data: project, isPending, isError } = useProject(projectId);
  const { data: steps = [], isPending: isStepsPending, isError: isStepsError } = useSteps(projectId);
  const { data: tasks = [], isPending: isTasksPending, isError: isTasksError } = useTasks(projectId);
  const updateProject = useUpdateProject(projectId);
  const createStep = useCreateStep();
  const updateSteps = useUpdateSteps(projectId);
  const deleteStep = useDeleteStep(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const reorderTasks = useReorderTasks(projectId);
  const [editing, setEditing] = useState(false);
  const [creatingStep, setCreatingStep] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [confirmingDeleteStep, setConfirmingDeleteStep] = useState(false);
  const [creatingTaskStepId, setCreatingTaskStepId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stepName, setStepName] = useState('');
  const [stepDetailsName, setStepDetailsName] = useState('');
  const [stepDetailsPosition, setStepDetailsPosition] = useState('1');
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDetailsName, setTaskDetailsName] = useState('');
  const [taskDetailsDescription, setTaskDetailsDescription] = useState('');
  const [taskDetailsStepId, setTaskDetailsStepId] = useState('');
  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const visibleTasks = previewTasks ?? tasks;
  const orderedSteps = useMemo(
    () => [...steps].sort((firstStep, secondStep) => (
      (firstStep.position ?? 0) - (secondStep.position ?? 0)
    )),
    [steps]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const tasksByStep = useMemo(() => {
    const groupedTasks = new Map<string, Task[]>();

    for (const task of visibleTasks) {
      if (!task.stepId) continue;

      const stepTasks = groupedTasks.get(task.stepId) ?? [];
      groupedTasks.set(task.stepId, [...stepTasks, task]);
    }

    for (const [stepId, stepTasks] of groupedTasks.entries()) {
      groupedTasks.set(
        stepId,
        [...stepTasks].sort((firstTask, secondTask) => firstTask.position - secondTask.position)
      );
    }

    return groupedTasks;
  }, [visibleTasks]);
  const selectedTask = useMemo(
    () => visibleTasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, visibleTasks]
  );
  const editingStep = useMemo(
    () => orderedSteps.find((step) => step.id === editingStepId) ?? null,
    [editingStepId, orderedSteps]
  );

  function openEditModal() {
    if (!project) return;

    setName(project.name);
    setDescription(project.description ?? '');
    updateProject.reset();
    setEditing(true);
  }

  function closeEditModal() {
    setEditing(false);
    updateProject.reset();
  }

  function openCreateStepModal() {
    setStepName('');
    createStep.reset();
    setCreatingStep(true);
  }

  function closeCreateStepModal() {
    setCreatingStep(false);
    createStep.reset();
  }

  function openEditStepModal(step: Step) {
    const currentPosition = orderedSteps.findIndex((currentStep) => currentStep.id === step.id);

    setEditingStepId(step.id);
    setStepDetailsName(step.name);
    setStepDetailsPosition(String(currentPosition + 1));
    setConfirmingDeleteStep(false);
    updateSteps.reset();
    deleteStep.reset();
  }

  function closeEditStepModal() {
    setEditingStepId(null);
    setConfirmingDeleteStep(false);
    updateSteps.reset();
    deleteStep.reset();
  }

  function openCreateTaskModal(stepId: string) {
    setCreatingTaskStepId(stepId);
    setTaskName('');
    setTaskDescription('');
    createTask.reset();
  }

  function closeCreateTaskModal() {
    setCreatingTaskStepId(null);
    createTask.reset();
  }

  function openTaskDetailsModal(task: Task) {
    setSelectedTaskId(task.id);
    setTaskDetailsName(task.name);
    setTaskDetailsDescription(task.description ?? '');
    setTaskDetailsStepId(task.stepId ?? '');
    updateTask.reset();
  }

  function closeTaskDetailsModal() {
    setSelectedTaskId(null);
    updateTask.reset();
  }

  function onEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!project) return;

    const nextName = name.trim();
    const nextDescription = description.trim();
    const currentDescription = project.description ?? '';
    const changed =
      nextName !== project.name ||
      nextDescription !== currentDescription;

    if (!changed) {
      closeEditModal();
      return;
    }

    updateProject.mutate(
      {
        name: nextName,
        description: nextDescription || undefined,
      },
      {
        onSuccess() {
          setEditing(false);
        },
      }
    );
  }

  function onCreateTaskSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = taskName.trim();

    if (!nextName || !creatingTaskStepId) return;

    const currentStepTasks = tasksByStep.get(creatingTaskStepId) ?? [];

    createTask.mutate(
      {
        name: nextName,
        stepId: creatingTaskStepId,
        description: taskDescription.trim() || undefined,
        position: currentStepTasks.length,
      },
      {
        onSuccess() {
          setCreatingTaskStepId(null);
        },
      }
    );
  }

  function onCreateStepSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = stepName.trim();

    if (!nextName) return;

    createStep.mutate(
      {
        name: nextName,
        projectId,
        position: steps.length,
      },
      {
        onSuccess() {
          setCreatingStep(false);
        },
      }
    );
  }

  function onEditStepSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingStep) return;

    const nextName = stepDetailsName.trim();
    const currentPosition = orderedSteps.findIndex((step) => step.id === editingStep.id);
    const nextPosition = Math.min(
      Math.max(Number(stepDetailsPosition) - 1, 0),
      Math.max(orderedSteps.length - 1, 0)
    );

    if (!nextName) return;

    const changed = nextName !== editingStep.name || nextPosition !== currentPosition;

    if (!changed) {
      closeEditStepModal();
      return;
    }

    const nextSteps = orderedSteps.filter((step) => step.id !== editingStep.id);
    nextSteps.splice(nextPosition, 0, {
      ...editingStep,
      name: nextName,
    });

    updateSteps.mutate(
      nextSteps.map((step, index) => ({
        ...step,
        position: index,
      })),
      {
        onSuccess() {
          setEditingStepId(null);
        },
      }
    );
  }

  function onDeleteStep() {
    if (!editingStep) return;

    if (!confirmingDeleteStep) {
      setConfirmingDeleteStep(true);
      deleteStep.reset();
      return;
    }

    deleteStep.mutate(editingStep.id, {
      onSuccess() {
        setEditingStepId(null);
        setConfirmingDeleteStep(false);
      },
    });
  }

  function onTaskDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTask) return;

    const nextName = taskDetailsName.trim();
    const nextDescription = taskDetailsDescription.trim();
    const nextStepId = taskDetailsStepId || selectedTask.stepId;
    const currentDescription = selectedTask.description ?? '';
    const stepChanged = Boolean(nextStepId) && nextStepId !== selectedTask.stepId;
    const changed =
      nextName !== selectedTask.name ||
      nextDescription !== currentDescription ||
      stepChanged;

    if (!nextName || !nextStepId) return;

    if (!changed) {
      closeTaskDetailsModal();
      return;
    }

    const targetStepTasks = tasksByStep
      .get(nextStepId)
      ?.filter((task) => task.id !== selectedTask.id) ?? [];

    updateTask.mutate(
      {
        taskId: selectedTask.id,
        dto: {
          name: nextName,
          description: nextDescription || undefined,
          stepId: nextStepId,
          position: stepChanged ? targetStepTasks.length : selectedTask.position,
        },
      },
      {
        onSuccess() {
          setSelectedTaskId(null);
        },
      }
    );
  }

  function reorderTask(draggedTaskId: string, targetStepId: string, targetTaskId?: string) {
    if (reorderTasks.isPending) return;

    const nextTasks = reorderTasksByDrop({
      draggedTaskId,
      targetStepId,
      targetTaskId,
      tasks: visibleTasks,
    });

    setDraggedTaskId(null);
    setPreviewTasks(null);

    if (nextTasks) {
      const changedTasks = getChangedTaskPlacements(tasks, nextTasks);

      if (changedTasks.length > 0) {
        reorderTasks.mutate({ changedTasks, nextTasks });
      }
    }
  }

  function onDragStart(event: DragStartEvent) {
    setDraggedTaskId(String(event.active.id));
    setPreviewTasks(tasks);
  }

  function onDragOver(event: DragOverEvent) {
    const activeTaskId = String(event.active.id);
    const target = getDropTarget(event);

    if (!target) return;

    setPreviewTasks((currentPreviewTasks) => {
      const currentTasks = currentPreviewTasks ?? tasks;
      const nextTasks = reorderTasksByDrop({
        draggedTaskId: activeTaskId,
        targetStepId: target.stepId,
        targetTaskId: target.taskId,
        tasks: currentTasks,
      });

      return nextTasks ?? currentPreviewTasks;
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const activeTaskId = String(event.active.id);
    const target = getDropTarget(event);

    setDraggedTaskId(null);

    if (!target) {
      setPreviewTasks(null);
      return;
    }

    if (previewTasks) {
      const nextTasks = previewTasks;
      const changedTasks = getChangedTaskPlacements(tasks, nextTasks);

      setPreviewTasks(null);

      if (changedTasks.length > 0) {
        reorderTasks.mutate({ changedTasks, nextTasks });
      }

      return;
    }

    reorderTask(activeTaskId, target.stepId, target.taskId);
  }

  if (isPending) {
    return (
      <main className="flex h-full w-full items-center justify-center p-[30px]">
        <p className="text-white/60">Carregando projeto...</p>
      </main>
    );
  }

  if (isError || !project) {
    return (
      <main className="flex h-full w-full flex-col items-center justify-center gap-4 p-[30px]">
        <p className="text-center text-white/80">Projeto não encontrado ou API indisponível.</p>
        <Link href="/tasks" className="text-accent hover:underline">
          ← Voltar para projetos
        </Link>
      </main>
    );
  }

  return (
    <main className="flex h-full w-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Projeto
            </p>
            <h1 className="text-3xl font-semibold text-white">{project.name}</h1>
            {project.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                {project.description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/45">Sem descrição adicionada.</p>
            )}
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Editar projeto"
            onClick={openEditModal}
          >
            <IconEdit className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
          <span className="rounded-md bg-white/5 px-3 py-1.5">Tags</span>
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 text-white/60 transition-colors hover:border-accent hover:text-white"
            aria-label="Adicionar tag"
          >
            <IconAdd className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Etapas</h2>
          <p className="text-sm text-white/45">Organize as tarefas do projeto por status.</p>
        </div>

        <Button
          fullWidth={false}
          className="!w-auto rounded-lg px-4 text-sm"
          onClick={openCreateStepModal}
        >
          <span className="flex items-center justify-center gap-2">
            <IconAdd className="h-4 w-4" />
            Nova etapa
          </span>
        </Button>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
        {isStepsPending || isTasksPending ? (
          <div className="flex min-h-[320px] w-full items-center justify-center">
            <p className="text-sm text-white/55">Carregando etapas...</p>
          </div>
        ) : isStepsError || isTasksError ? (
          <div className="flex min-h-[320px] w-full items-center justify-center rounded-lg border border-amber-300/15 bg-amber-300/10 px-6 text-center">
            <p className="text-sm text-amber-200/90">
              Não foi possível carregar as etapas e tarefas deste projeto.
            </p>
          </div>
        ) : steps.length > 0 ? (
          <DndContext
            collisionDetection={closestCorners}
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => {
              setDraggedTaskId(null);
              setPreviewTasks(null);
            }}
          >
            {orderedSteps.map((step) => {
              const stepTasks = tasksByStep.get(step.id) ?? step.cards ?? [];

              return (
                <StepColumn
                  key={step.id}
                  activeTaskId={draggedTaskId}
                  name={step.name}
                  stepId={step.id}
                  tasks={stepTasks}
                  onAddTask={() => openCreateTaskModal(step.id)}
                  onEditStep={() => openEditStepModal(step)}
                  onOpenTask={openTaskDetailsModal}
                />
              );
            })}
          </DndContext>
        ) : (
          <div className="flex min-h-[320px] w-full items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03]">
            <div className="flex max-w-sm flex-col items-center px-6 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/70">
                <IconAdd className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-white">Nenhuma etapa criada</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Crie a primeira etapa para começar a distribuir as tarefas deste projeto.
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={editing}
        title="Detalhes do projeto"
        description="Editar projeto"
        onClose={closeEditModal}
        closeOnBackdrop={!updateProject.isPending}
        closeOnEscape={!updateProject.isPending}
      >
        <form onSubmit={onEditSubmit}>
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

            {updateProject.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {updateProject.error.message}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              className="rounded-lg px-4 text-sm"
              onClick={closeEditModal}
              disabled={updateProject.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              className="!w-auto rounded-lg px-4 text-sm"
              disabled={updateProject.isPending || !name.trim()}
            >
              {updateProject.isPending ? 'Salvando...' : 'Concluir'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={creatingStep}
        title="Nova etapa"
        description="Criar coluna"
        onClose={closeCreateStepModal}
        closeOnBackdrop={!createStep.isPending}
        closeOnEscape={!createStep.isPending}
      >
        <form onSubmit={onCreateStepSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Nome da coluna</span>
              <input
                value={stepName}
                onChange={(event) => setStepName(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Ex: Em andamento"
                required
              />
            </label>

            {createStep.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {createStep.error.message}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              className="rounded-lg px-4 text-sm"
              onClick={closeCreateStepModal}
              disabled={createStep.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              className="!w-auto rounded-lg px-4 text-sm"
              disabled={createStep.isPending || !stepName.trim()}
            >
              {createStep.isPending ? 'Criando...' : 'Criar etapa'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(creatingTaskStepId)}
        title="Nova tarefa"
        description="Criar task"
        onClose={closeCreateTaskModal}
        closeOnBackdrop={!createTask.isPending}
        closeOnEscape={!createTask.isPending}
      >
        <form onSubmit={onCreateTaskSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Título</span>
              <input
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Nome da tarefa"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Descrição</span>
              <textarea
                value={taskDescription}
                onChange={(event) => setTaskDescription(event.target.value)}
                className="min-h-24 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Detalhes da tarefa"
              />
            </label>

            {createTask.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {createTask.error.message}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              className="rounded-lg px-4 text-sm"
              onClick={closeCreateTaskModal}
              disabled={createTask.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              className="!w-auto rounded-lg px-4 text-sm"
              disabled={createTask.isPending || !taskName.trim()}
            >
              {createTask.isPending ? 'Criando...' : 'Criar tarefa'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingStep)}
        title="Detalhes da etapa"
        description="Editar coluna"
        onClose={closeEditStepModal}
        closeOnBackdrop={!updateSteps.isPending && !deleteStep.isPending}
        closeOnEscape={!updateSteps.isPending && !deleteStep.isPending}
      >
        <form onSubmit={onEditStepSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Nome da coluna</span>
              <input
                value={stepDetailsName}
                onChange={(event) => setStepDetailsName(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Ex: Em andamento"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Posição</span>
              <select
                value={stepDetailsPosition}
                onChange={(event) => setStepDetailsPosition(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-accent"
                required
              >
                {orderedSteps.map((step, index) => (
                  <option key={step.id} value={index + 1} className="bg-app-bg text-white">
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>

            {updateSteps.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {updateSteps.error.message}
              </p>
            ) : null}

            {deleteStep.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {deleteStep.error.message}
              </p>
            ) : null}

            {confirmingDeleteStep ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm leading-5 text-red-100">
                Confirme para excluir esta coluna. As tarefas vinculadas a ela podem ser afetadas
                conforme a regra da API.
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              className={`rounded-lg px-4 text-sm ${
                confirmingDeleteStep ? '!text-red-200 !hover:text-red-100' : '!text-red-300 !hover:text-red-200'
              }`}
              onClick={onDeleteStep}
              disabled={updateSteps.isPending || deleteStep.isPending}
            >
              <span className="flex items-center justify-center gap-2">
                <IconDelete className="h-4 w-4" />
                {deleteStep.isPending
                  ? 'Excluindo...'
                  : confirmingDeleteStep
                    ? 'Confirmar exclusão'
                    : 'Excluir coluna'}
              </span>
            </Button>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                fullWidth={false}
                className="rounded-lg px-4 text-sm"
                onClick={closeEditStepModal}
                disabled={updateSteps.isPending || deleteStep.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth={false}
                className="!w-auto rounded-lg px-4 text-sm"
                disabled={updateSteps.isPending || deleteStep.isPending || !stepDetailsName.trim()}
              >
                {updateSteps.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedTask)}
        title="Detalhes da tarefa"
        description="Visualizar e editar"
        onClose={closeTaskDetailsModal}
        className="max-w-lg"
        closeOnBackdrop={!updateTask.isPending}
        closeOnEscape={!updateTask.isPending}
      >
        <form onSubmit={onTaskDetailsSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Título</span>
              <input
                value={taskDetailsName}
                onChange={(event) => setTaskDetailsName(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Nome da tarefa"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Descrição</span>
              <textarea
                value={taskDetailsDescription}
                onChange={(event) => setTaskDetailsDescription(event.target.value)}
                className="min-h-28 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/35 focus:border-accent"
                placeholder="Detalhes da tarefa"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white/80">Etapa</span>
              <select
                value={taskDetailsStepId}
                onChange={(event) => setTaskDetailsStepId(event.target.value)}
                className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-accent"
                required
              >
                {steps.map((step) => (
                  <option key={step.id} value={step.id} className="bg-app-bg text-white">
                    {step.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedTask ? (
              <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60 sm:grid-cols-2">
                <p>
                  <span className="block text-xs uppercase tracking-[0.14em] text-white/35">
                    Posição
                  </span>
                  #{selectedTask.position + 1}
                </p>
                <p>
                  <span className="block text-xs uppercase tracking-[0.14em] text-white/35">
                    ID
                  </span>
                  <span className="break-all">{selectedTask.id}</span>
                </p>
              </div>
            ) : null}

            {updateTask.isError ? (
              <p className="rounded-lg border border-red-300/15 bg-red-300/10 px-3 py-2 text-sm text-red-200">
                {updateTask.error.message}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              className="rounded-lg px-4 text-sm"
              onClick={closeTaskDetailsModal}
              disabled={updateTask.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              className="!w-auto rounded-lg px-4 text-sm"
              disabled={updateTask.isPending || !taskDetailsName.trim() || !taskDetailsStepId}
            >
              {updateTask.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
