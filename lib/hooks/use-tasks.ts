'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskDto, Task } from '@/lib/api/api';
import { createTask, loadTasks, saveTask } from '@/lib/api/client-api';
import { taskKeys } from '@/lib/query-keys';

export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => loadTasks(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskDto>({
    mutationFn: (dto) => createTask(projectId, dto),
    onSuccess(task) {
      queryClient.setQueryData<Task[]>(taskKeys.byProject(projectId), (tasks) => (
        tasks ? [...tasks, task] : [task]
      ));
      queryClient.setQueryData(taskKeys.detail(task.id), task);
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { taskId: string; dto: Partial<CreateTaskDto> }>({
    mutationFn: ({ taskId, dto }) => saveTask(projectId, taskId, dto),
    onSuccess(updatedTask) {
      queryClient.setQueryData<Task[]>(taskKeys.byProject(projectId), (tasks) => (
        tasks?.map((task) => (task.id === updatedTask.id ? updatedTask : task)) ?? [updatedTask]
      ));
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    },
  });
}

export function useReorderTasks(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Task[],
    Error,
    { changedTasks: Task[]; nextTasks: Task[] },
    { previousTasks?: Task[] }
  >({
    mutationFn: async ({ changedTasks, nextTasks }) => {
      await Promise.all(
        changedTasks.map((task) => (
          saveTask(projectId, task.id, {
            position: task.position,
            stepId: task.stepId,
          })
        ))
      );

      return nextTasks;
    },
    onMutate({ nextTasks }) {
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.byProject(projectId));
      queryClient.setQueryData(taskKeys.byProject(projectId), nextTasks);

      return { previousTasks };
    },
    onError(_error, _nextTasks, context) {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.byProject(projectId), context.previousTasks);
      }
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: taskKeys.byProject(projectId) });
    },
  });
}
