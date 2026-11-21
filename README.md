# Biblioteca API (UERN)

[![CI](https://github.com/madsondecarvalho/uern-projeto-backend-biblioteca/actions/workflows/ci.yml/badge.svg)](https://github.com/madsondecarvalho/uern-projeto-backend-biblioteca/actions/workflows/ci.yml)

Projeto final da disciplina **DSI0015 — Desenvolvimento Web Back-End** do curso de **Sistemas para Internet** da **UERN**.

**Aluno:** Madson Gustavo Fagundes Pinto de Carvalho

---

Projeto de backend em Node.js/Express que expõe recursos de livros, autores, categorias, cópias e reservas com camada de serviço e controlador.

## Estrutura principal
- `server.js` - inicializador do servidor e configuração global do Express.
- `src/controllers` - handlers HTTP que chamam o serviço e mapeiam erros para respostas JSON.
- `src/services` - lógica de domínio (validações, fluxo de CRUD) e lançamento de `ServiceError` quando necessário.
- `src/models` - acesso ao banco libSQL/Turso com SQL parametrizado.
- `src/routes` - definição das rotas da API (já integrada ao `Express`).
- `tests` - suítes unitárias para service e controller com Jest + mocks, além de testes de integração dos models com SQLite em memória.
- `scripts/db` - schema, migrations e seed idempotentes do banco.

## Documentação

A documentação completa da API com endpoints, schemas, exemplos curl e diagrama de classes está na pasta [`docs/`](docs/README.md).

- [Autenticação](docs/auth.md) — Login, JWT, usuários de teste
- [Livros](docs/books.md) — CRUD + filtros
- [Autores](docs/authors.md), [Categorias](docs/categories.md), [Cópias](docs/copies.md)
- [Reservas](docs/reservations.md) — Fluxo completo
- [Usuários e Roles](docs/users.md)
- [Health Check](docs/health.md)
- [Banco de dados (Turso)](docs/database.md)
- [CORS](docs/cors.md)
- [CI/CD](docs/ci.md) — GitHub Actions, migrations no Turso e deploy no Render
- [Diagrama de Classes](docs/class-diagram.md)

## Pré-requisitos
- Node.js 22 (definido em `.nvmrc`) com npm.
- Docker e Docker Compose (opcional, para execução em container).
- Conta no [Turso](https://turso.tech) para produção, ou SQLite local para desenvolvimento.

## Instalação

### Local (sem Docker)
```bash
npm install
cp .env.example .env
npm run db:setup
```

> No Windows/PowerShell: `Copy-Item .env.example .env`.

### Com Docker Compose (opcional)
Sobe a API com um banco SQLite local persistido em volume:

```bash
docker compose up -d
```

Para usar o Turso remoto, preencha `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` no `.env` antes de subir.

A API ficará disponível em `http://localhost:3333`.

Para parar os containers:

```bash
docker compose down
```

Para remover também o volume do banco local:

```bash
docker compose down -v
```

## Execução

### Local (sem Docker)
Configure o banco no `.env` e inicie o servidor:

```bash
npm start
```

## Banco de dados (Turso/libSQL)

O projeto usa [Turso](https://turso.tech), que fala **libSQL** (SQLite). Não há mais PostgreSQL/Sequelize.

| Variável | Uso |
|----------|-----|
| `TURSO_DATABASE_URL` | `file:./biblioteca.db` em desenvolvimento ou `libsql://...` em produção |
| `TURSO_AUTH_TOKEN` | token do banco Turso (vazio para arquivo local) |

Comandos:

```bash
npm run db:migrate   # cria/atualiza tabelas e índices
npm run db:seed      # insere dados de demonstração (ignora se já houver dados)
npm run db:setup     # db:migrate + db:seed
```

Os scripts são idempotentes e podem rodar novamente sem duplicar o schema ou os dados de demonstração.

## CORS

As origens liberadas são configuradas por variável de ambiente:

```env
FRONTEND_URLS=https://biblioteca-frontend-projeto-uern.onrender.com,http://localhost:3000,http://localhost:5173
```

- Use o origin completo, **sem caminho e sem barra final**.
- Separe múltiplos origins por vírgula.
- Aceita curingas, como `https://*.onrender.com`.
- Se nenhuma variável for configurada, a API libera qualquer origem (útil apenas em desenvolvimento).
- Aliases aceitos: `CORS_ORIGINS`, `FRONTEND_URL`, `CORS_ORIGIN`.

Para cookies/credenciais, defina `CORS_CREDENTIALS=true`. Detalhes e troubleshooting em [`docs/cors.md`](docs/cors.md).

## Testes
- Testes unitários:
  ```bash
  npm run test:unit
  ```
- Testes de integração (models com SQLite em memória):
  ```bash
  npm run test:integration
  ```
- Suíte completa com cobertura:
  ```bash
  npm run test:ci
  ```

## CI/CD (GitHub Actions + Render)

O pipeline está em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) e roda em pushes na `main`, pull requests e execução manual (`workflow_dispatch`). A documentação detalhada está em [`docs/ci.md`](docs/ci.md).

| Job | O que faz |
|-----|-----------|
| `Testes unitários` | `npm ci` + Jest com cobertura (sem os testes de integração); publica o artefato `coverage` |
| `Testes de integração` | Jest nos models com SQLite em memória |
| `Migrate & seed` | aplica schema e seed idempotente no Turso usando os secrets do repositório; valida as tabelas |
| `Build` | instala só dependências de produção (`npm ci --omit=dev`) e valida o carregamento da aplicação com `npm run build` |
| `Smoke test` | aplica schema/seed em SQLite local, inicia a API e valida health + fluxo de livros, login, usuários, cópias e reservas |
| `Deploy no Render` | em push na `main`, dispara o deploy hook — somente após migrations e se o secret existir |

A versão do Node é fixada em `.nvmrc` (22) e usada pelo CI e pelo Render.

### Migrations e seeds no CI

O job `Migrate & seed (Turso)` roda em push na `main` e também manualmente (`workflow_dispatch`), usando os secrets:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Ele aplica `npm run db:migrate`, executa `npm run db:seed` (idempotente) e valida as tabelas com `npm run db:check`. O deploy no Render depende desse job.

Para rodar manualmente: **Actions → CI → Run workflow** na branch `main`. O input `seed` permite desmarcar o seed quando quiser apenas migrations.

### Configuração no Render

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`
- **Node:** definido pelo `.nvmrc` (22)

### Deploy controlado pelo CI (opcional)

Por padrão, o Render faz deploy automático a cada push na branch conectada. Para o deploy só acontecer depois que testes, build, smoke test e migrations passarem:

1. No Render, abra **Settings → Deploy Hook** e copie a URL.
2. Desabilite o **Auto-Deploy** do serviço.
3. No GitHub, em **Settings → Secrets and variables → Actions**, crie o secret `RENDER_DEPLOY_HOOK_URL` com a URL copiada.

Sem esse secret, o job de deploy apenas registra um aviso e não falha. Se o Auto-Deploy continuar habilitado, não configure o secret — caso contrário o Render fará dois deploys por push.

## Notas rápidas
- A API segue ESM (`"type": "module"`) e usa o `babel-jest` para transformar os testes com Jest.
- Para alterar dados iniciais, edite `scripts/db/seedData.js` e rode `npm run db:seed` em um banco vazio.

## Exemplos de `curl`
- **Listar livros:**
  ```bash
  curl http://localhost:3333/api/books
  ```
- **Buscar livro por ID:**
  ```bash
  curl http://localhost:3333/api/books/1
  ```
- **Criar livro:**
  ```bash
  curl -X POST http://localhost:3333/api/books \
    -H "Content-Type: application/json" \
    -d '{"title":"Iracema","authorId":1,"year":1865,"categoryId":1}'
  ```
- **Atualizar livro:**
  ```bash
  curl -X PUT http://localhost:3333/api/books/1 \
    -H "Content-Type: application/json" \
    -d '{"title":"Iracema","authorId":1,"year":1865,"categoryId":2}'
  ```
- **Remover livro:**
  ```bash
  curl -X DELETE http://localhost:3333/api/books/1
  ```

