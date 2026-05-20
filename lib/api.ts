const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://task-manager-api-1-ym8c.onrender.com';

export type Project = {
  id: string;
  name: string;
  description?: string;
};

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Falha ao carregar projetos');
  return response.json();
}

export async function fetchProject(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Falha ao carregar projeto');
  return response.json();
}
