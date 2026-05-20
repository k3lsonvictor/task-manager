const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type Project = { id: string; name: string };

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Falha ao carregar projetos');
  return response.json();
}
