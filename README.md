# Task Manager

Gerenciador de tarefas em projetos, construído com **Next.js** (App Router), **React** e **Tailwind CSS v4**.

## Rotas

- `/login` — autenticação
- `/signin` — cadastro
- `/tasks` — lista de projetos
- `/tasks/[projectId]` — quadro do projeto

## Desenvolvimento

```bash
npm install
npm run dev
```

Se aparecer `Cannot find module '@tailwindcss/postcss'`, reinstale as dependências e limpe o cache:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

Use **npm** neste projeto (não misture com pnpm sem `pnpm-lock.yaml`).

Acesse [http://localhost:3000](http://localhost:3000).

## API

Por padrão, o frontend usa a API em produção (`Render`). O host gratuito pode demorar no **cold start** (10–30s na primeira requisição).

Para apontar para outra API:

```bash
NEXT_PUBLIC_API_URL=https://sua-api.com npm run dev
```

> O Next.js roda em `localhost:3000`. Se usar `json-server` local, suba em outra porta (ex.: `3001`) para não conflitar.

## Scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run start`| Servidor de produção   |
| `npm run lint` | ESLint                 |

## Estrutura

```
app/          — rotas e páginas (App Router)
components/   — UI, layout (sidebar) e kanban
lib/          — utilitários e cliente da API
backend/      — mock json-server (opcional, desenvolvimento local)
public/       — imagens e assets estáticos
```

## Estilo

Paleta e layout espelham o projeto Angular original (`#1E1F29`, `#2A2B3D`, `#282A37`, gradiente no cabeçalho do projeto, colunas de etapas e cards).
