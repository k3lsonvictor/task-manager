import type { CreateTaskDto, Project, UpdateProjectDto, UpdateStepDto, UpdateTaskDto, createProjectDto, Step, Task, createStepDto } from '@/lib/api/api';

let unauthorizedRedirect: Promise<never> | null = null;

function getLoginUrl() {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const loginUrl = new URL('/login', window.location.origin);

  if (currentPath !== '/login') {
    loginUrl.searchParams.set('redirect', currentPath);
  }

  return loginUrl.toString();
}

async function handleUnauthorized(): Promise<never> {
  if (!unauthorizedRedirect) {
    unauthorizedRedirect = (async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } finally {
        window.location.replace(getLoginUrl());
      }

      return new Promise<never>(() => undefined);
    })();
  }

  return unauthorizedRedirect;
}

async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  // As rotas /api já tentaram renovar a sessão antes de devolver um 401.
  if (response.status === 401 && typeof window !== 'undefined') {
    return handleUnauthorized();
  }

  return response;
}

//PROJECTS

export async function createProject(dto: createProjectDto): Promise<Project> {
  const response = await authenticatedFetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  if (!response.ok) throw new Error('Falha ao criar projeto');
  return response.json();
}

export async function loadProjects(): Promise<Project[]> {
  const response = await authenticatedFetch('/api/projects');
  if (!response.ok) throw new Error('Falha ao carregar projetos');
  return response.json();
}

export async function loadProject(projectId: string): Promise<Project> {
  const response = await authenticatedFetch(`/api/projects/${projectId}`);
  if (!response.ok) throw new Error('Falha ao carregar projeto');
  return response.json();
}

export async function saveProject(projectId: string, dto: UpdateProjectDto): Promise<Project> {
  const response = await authenticatedFetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) throw new Error('Falha ao atualizar projeto');
  return response.json();
}

//STEPS
export async function loadSteps(projectId: string): Promise<Step[]> {
  const response = await authenticatedFetch(`/api/steps/${projectId}`);

  if (!response.ok) throw new Error('Falha ao carregar etapas');
  const data = await response.json();
  const steps = Array.isArray(data) ? data : data?.steps ?? [];

  return steps.map((step: Step) => ({
    ...step,
    name: step.name ?? step.title ?? '',
  }));
}

export async function createStep(dto: createStepDto): Promise<Step> {
  const { projectId, ...stepDto } = dto;

  const response = await authenticatedFetch(`/api/steps/${projectId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stepDto),
  });

  if(!response.ok) throw new Error('Falha ao criar a etapa');
  const data = await response.json();

  return {
    ...data,
    name: data.name ?? data.title,
  };
}

export async function saveStep(
  projectId: string,
  stepId: string,
  dto: UpdateStepDto
): Promise<Step> {
  const response = await authenticatedFetch(`/api/steps/${projectId}/${stepId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) throw new Error('Falha ao atualizar etapa');
  const data = await response.json();

  return {
    ...data,
    name: data.name ?? data.title ?? '',
    position: data.position ?? 0,
  };
}

export async function deleteStep(projectId: string, stepId: string): Promise<void> {
  const response = await authenticatedFetch(`/api/steps/${projectId}/${stepId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Falha ao excluir etapa');
}

//TASKS
export async function loadTasks(projectId: string): Promise<Task[]> {
  const response = await authenticatedFetch(`/api/tasks/${projectId}`);

  if (!response.ok) throw new Error('Falha ao carregar tarefas');
  const data = await response.json();

  const tasks = Array.isArray(data) ? data : data?.tasks ?? [];

  return tasks.map((task: Task) => ({
    ...task,
    name: task.name ?? task.title ?? '',
    position: task.position ?? 0,
  }));
}

export async function createTask(projectId: string, dto: CreateTaskDto): Promise<Task> {
  const response = await authenticatedFetch(`/api/tasks/${projectId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) throw new Error('Falha ao criar tarefa');
  const data = await response.json();

  return {
    ...data,
    name: data.name ?? data.title ?? '',
    position: data.position ?? 0,
  };
}

export async function saveTask(
  projectId: string,
  taskId: string,
  dto: UpdateTaskDto
): Promise<Task> {
  const response = await authenticatedFetch(`/api/tasks/${projectId}/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) throw new Error('Falha ao atualizar tarefa');
  const data = await response.json();

  return {
    ...data,
    name: data.name ?? data.title ?? '',
    position: data.position ?? 0,
  };
}
