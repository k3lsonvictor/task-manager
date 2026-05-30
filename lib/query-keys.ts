export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
};

export const stepKeys = {
  all: ['steps'] as const,
  byProject: (projectId: string) => ['steps', 'project', projectId] as const,
  detail: (id: string) => ['steps', id] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
  detail: (id: string) => ['tasks', id] as const,
};
