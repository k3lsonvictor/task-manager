import { Button } from '@/components/ui/button';

export default function TasksPage() {
  return (
    <main className="flex h-full w-full flex-col p-[30px]">
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex h-[50%] w-[30%] min-w-[280px] flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-gray-600">
          <p className="text-center text-lg text-foreground">
            Escolha um projeto ao lado ou crie um novo projeto
          </p>
          <Button fullWidth={false} className="min-w-[160px]">
            Novo Projeto
          </Button>
        </div>
      </div>
    </main>
  );
}
