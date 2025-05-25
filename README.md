# Task Manager

Task Manager é uma aplicação web desenvolvida em Angular para organização de tarefas em projetos, com suporte a etapas (steps), cartões (cards), tags, e gerenciamento de projetos colaborativos.

## Funcionalidades

- **Gerenciamento de Projetos:** Crie, edite e exclua projetos.
- **Etapas (Steps):** Organize tarefas em etapas personalizadas.
- **Cartões (Cards):** Adicione, edite, mova e exclua tarefas dentro das etapas.
- **Tags:** Categorize tarefas com tags coloridas.
- **Drag & Drop:** Reordene tarefas e etapas facilmente.
- **Modais Dinâmicos:** Edição e visualização de detalhes em modais.
- **Autenticação:** Proteção de rotas e gerenciamento de sessão.
- **Responsivo:** Interface adaptada para diferentes tamanhos de tela.

## Tecnologias Utilizadas

- [Angular](https://angular.io/) 19+
- RxJS
- Angular Material
- [CDK Drag & Drop](https://material.angular.io/cdk/drag-drop/overview)
- TypeScript

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/task-manager.git
cd task-manager
npm install
```

## Servidor de Desenvolvimento

Para iniciar o servidor local:

```bash
ng serve
```

Acesse [http://localhost:4200/](http://localhost:4200/) no navegador.

## Build de Produção

Para gerar uma build otimizada:

```bash
ng build
```

Os arquivos finais estarão em `dist/`.

## Testes

### Unitários

Execute os testes unitários com:

```bash
ng test
```

### End-to-End (E2E)

Para testes e2e (caso configurado):

```bash
ng e2e
```

> **Nota:** O Angular CLI não inclui um framework e2e por padrão. Você pode configurar Cypress, Playwright ou outro de sua preferência.

## Estrutura do Projeto

```
src/
  app/
    components/
    pages/
    services/
    api/
    guards/
    ...
```

- **components/**: Componentes reutilizáveis (botões, modais, colunas, etc)
- **pages/**: Páginas principais (Home, Login, etc)
- **services/**: Serviços de lógica de negócio e comunicação
- **api/**: Serviços de integração com backend
- **guards/**: Proteção de rotas

## Contribuição

Contribuições são bem-vindas!  
Abra uma issue ou envie um pull request.

## Recursos Adicionais

- [Documentação Angular CLI](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io/)

---

**Licença:** MIT

---