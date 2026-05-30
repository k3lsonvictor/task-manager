import { fetchWithTimeout, getAuthHeaders } from "./api-client";
import { ApiError, getErrorMessage } from "./api-errors";
import type { createStepDto, Step, UpdateStepDto } from "./api-types";

function normalizeStep(step: Step): Step {
  return {
    ...step,
    name: step.name ?? step.title ?? '',
  };
}

export async function fetchSteps(
  projectId: string,
  authHeader?: string | null
): Promise<Step[]> {
  const response = await fetchWithTimeout(`steps/${projectId}`, {
    headers: getAuthHeaders(authHeader),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao carregar etapas'), response.status);
  }

  const steps = Array.isArray(data) ? data : data?.steps ?? [];

  return steps.map(normalizeStep);
}

export async function createStep(
  projectId: string,
  dto: Omit<createStepDto, 'projectId'>,
  authHeader?: string | null
): Promise<Step> {
  const response = await fetchWithTimeout(`steps/${projectId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(authHeader),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao criar etapa'), response.status);
  }

  return {
    ...normalizeStep(data),
  };
}

export async function updateStep(
  projectId: string,
  stepId: string,
  dto: UpdateStepDto,
  authHeader?: string | null
): Promise<Step> {
  const response = await fetchWithTimeout(`steps/${projectId}/${stepId}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(authHeader),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao atualizar etapa'), response.status);
  }

  return normalizeStep(data);
}

export async function deleteStep(
  projectId: string,
  stepId: string,
  authHeader?: string | null
): Promise<void> {
  const response = await fetchWithTimeout(`steps/${projectId}/${stepId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(authHeader),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Falha ao excluir etapa'), response.status);
  }
}
