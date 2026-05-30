import type { Task } from '@/lib/api/api';

type ReorderTasksInput = {
  draggedTaskId: string;
  targetStepId: string;
  targetTaskId?: string;
  tasks: Task[];
};

function sortTasksByPosition(tasks: Task[]) {
  return [...tasks].sort((firstTask, secondTask) => firstTask.position - secondTask.position);
}

function withSequentialPositions(tasks: Task[]) {
  return tasks.map((task, index) => ({ ...task, position: index }));
}

export function reorderTasksByDrop({
  draggedTaskId,
  targetStepId,
  targetTaskId,
  tasks,
}: ReorderTasksInput): Task[] | null {
  if (draggedTaskId === targetTaskId) return null;

  const draggedTask = tasks.find((task) => task.id === draggedTaskId);

  if (!draggedTask) return null;

  const sourceStepId = draggedTask.stepId;
  const tasksWithoutDragged = tasks.filter((task) => task.id !== draggedTaskId);
  const targetStepTasks = sortTasksByPosition(
    tasksWithoutDragged.filter((task) => task.stepId === targetStepId)
  );
  const foundTargetIndex = targetTaskId
    ? targetStepTasks.findIndex((task) => task.id === targetTaskId)
    : -1;
  const targetIndex = foundTargetIndex >= 0 ? foundTargetIndex : targetStepTasks.length;
  const reorderedTargetStepTasks = withSequentialPositions([
    ...targetStepTasks.slice(0, targetIndex),
    { ...draggedTask, stepId: targetStepId },
    ...targetStepTasks.slice(targetIndex),
  ]);
  const sourceStepTasks = sourceStepId && sourceStepId !== targetStepId
    ? withSequentialPositions(
        sortTasksByPosition(tasksWithoutDragged.filter((task) => task.stepId === sourceStepId))
      )
    : [];
  const reorderedTaskIds = new Set([
    ...reorderedTargetStepTasks.map((task) => task.id),
    ...sourceStepTasks.map((task) => task.id),
  ]);

  return [
    ...tasksWithoutDragged.filter((task) => !reorderedTaskIds.has(task.id)),
    ...sourceStepTasks,
    ...reorderedTargetStepTasks,
  ];
}
