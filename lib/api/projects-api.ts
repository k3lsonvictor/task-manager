import { fetchWithTimeout, getAuthHeaders } from '@/lib/api/api-client';
import { ApiError, getErrorMessage } from '@/lib/api/api-errors';
import type { Project, UpdateProjectDto, createProjectDto } from '@/lib/api/api-types';

export async function fetchProjects(authHeader?: string | null): Promise<Project[]> {
  const response = await fetchWithTimeout('projects', {
    headers: getAuthHeaders(authHeader),
  });

  if (!response.ok) throw new ApiError('Falha ao carregar projetos', response.status);

  return response.json();
}

export async function fetchProject(
  projectId: string,
  authHeader?: string | null
): Promise<Project> {
  const response = await fetchWithTimeout(`projects/${projectId}`, {
    headers: getAuthHeaders(authHeader),
  });

  if (!response.ok) throw new ApiError('Falha ao carregar projeto', response.status);

  return response.json();
}

export async function createProject(
  dto: createProjectDto,
  authHeader?: string | null
): Promise<Project> {
  const response = await fetchWithTimeout('projects', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(authHeader),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao criar projeto'), response.status);
  }

  return data;
}

export async function updateProject(
  projectId: string,
  dto: UpdateProjectDto,
  authHeader?: string | null
): Promise<Project> {
  const response = await fetchWithTimeout(`projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(authHeader),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao atualizar projeto'), response.status);
  }

  return data;
}
