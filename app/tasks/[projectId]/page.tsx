import Link from 'next/link';

type Props = { params: Promise<{ projectId: string }> };

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;

  return (
    <main className="container">
      <Link href="/tasks">← Voltar</Link>
      <h1>Quadro do projeto {projectId}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <section className="card"><h2>A Fazer</h2></section>
        <section className="card"><h2>Em progresso</h2></section>
        <section className="card"><h2>Concluído</h2></section>
      </div>
    </main>
  );
}
