import { ProjectBoard } from '@/components/kanban/project-board';

type Props = { params: Promise<{ projectId: string }> };

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  return <ProjectBoard projectId={projectId} />;
}
