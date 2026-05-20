import Link from 'next/link';
import { fetchProjects } from '@/lib/api';

export default async function TasksPage() {
  const projects = await fetchProjects().catch(() => []);

  return (
    <main className="container">
      <h1>Projetos</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map((project) => (
          <Link className="card" key={project.id} href={`/tasks/${project.id}`}>
            {project.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
