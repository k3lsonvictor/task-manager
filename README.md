# Task Manager (Next.js)

Este repositório foi migrado de Angular para **React com Next.js (App Router)**.

## Rotas migradas
- `/login`
- `/signin`
- `/tasks`
- `/tasks/[projectId]`

## Rodando o projeto
```bash
npm install
npm run dev
```

## API
Por padrão, o frontend consulta a API em:

- `http://localhost:3000`

Para customizar, defina:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Observação da migração
A estrutura base foi portada para Next.js com páginas equivalentes e componentes iniciais.
A migração dos componentes avançados (drag and drop, modais e serviços completos) pode ser feita incrementalmente nas próximas etapas.
