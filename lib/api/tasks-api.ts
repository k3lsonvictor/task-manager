import { fetchWithTimeout, getAuthHeaders } from './api-client';
import { ApiError, getErrorMessage } from './api-errors';
import type { CreateTaskDto, Task, UpdateTaskDto } from './api-types';

function normalizeTask(task: Task): Task {
  return {
    ...task,
    name: task.name ?? task.title ?? '',
    position: task.position ?? 0,
  };
}

export async function fetchTasks(
  projectId: string,
  authHeader?: string | null
): Promise<Task[]> {
  const response = await fetchWithTimeout(`tasks/${projectId}`, {
    headers: getAuthHeaders(authHeader),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao carregar tarefas'), response.status);
  }

  const tasks = Array.isArray(data) ? data : data?.tasks ?? [];

  return tasks.map(normalizeTask);
}

export async function createTask(
  projectId: string,
  dto: CreateTaskDto,
  authHeader?: string | null
): Promise<Task> {
  const response = await fetchWithTimeout(`tasks/${projectId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(authHeader),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao criar tarefa'), response.status);
  }

  return normalizeTask(data);
}

export async function updateTask(
  projectId: string,
  taskId: string,
  dto: UpdateTaskDto,
  authHeader?: string | null
): Promise<Task> {
  const response = await fetchWithTimeout(`tasks/${projectId}/${taskId}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(authHeader),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao atualizar tarefa'), response.status);
  }

  return normalizeTask(data);
}
