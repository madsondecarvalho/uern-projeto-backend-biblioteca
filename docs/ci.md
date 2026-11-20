# CI/CD — GitHub Actions + Render

O projeto usa **GitHub Actions** para validar cada alteração e, opcionalmente, controlar o deploy no **Render**.

O pipeline está definido em [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Quando o pipeline roda

| Evento | Quando acontece |
|--------|-----------------|
| `push` | Apenas na branch `main` |
| `pull_request` | Ao abrir ou atualizar um pull request |
| `workflow_dispatch` | Execução manual pela aba **Actions** (a branch precisa ser `main` para migrations/deploy) |

Uma nova execução no mesmo branch cancela a anterior ainda em andamento (`concurrency`), evitando jobs duplicados.

## Fluxo

```
push na main / pull request
        │
        ├──────────────────────────┐
        ▼                          ▼
┌──────────────────┐   ┌──────────────────────────┐
│ Testes unitários │   │ Testes de integração     │
│ npm run test:unit│   │ npm run test:integration │
└────────┬─────────┘   └────────────┬─────────────┘
         └───────────┬──────────────┘
                     ▼
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐        ┌──────────────────────────┐
│    Build     │        │ Smoke test (Turso local) │
│ npm ci       │        │ schema + API + /health   │
│ --omit=dev   │        └────────────┬─────────────┘
│ npm run build│                     │
└──────┬───────┘                     │
       └─────────────┬───────────────┘
                     ▼
          ┌─────────────────────┐
          │ Migrate & seed      │  push main / manual
          │ Turso (secrets)     │
          └──────────┬──────────┘
                     ▼
          ┌─────────────────────┐
          │ Deploy no Render    │  somente push na main
          │ deploy hook (secret)│
          └─────────────────────┘
```

## Jobs

### 1. Testes unitários

Executa os testes de controllers, services, schemas e health check com cobertura:

```bash
npm ci
npm run test:unit
# jest --runInBand --coverage --testPathIgnorePatterns=integration.test.js
```

O relatório HTML/JSON gerado em `coverage/` é publicado como artefato por 7 dias na execução do workflow.

Os testes usam mocks para o banco, portanto esse job **não precisa de banco externo**.

### 2. Testes de integração

Executa os testes reais da camada de models contra um SQLite em memória:

```bash
npm ci
npm run test:integration
# jest --runInBand tests/database.integration.test.js
```

Esses testes exercitam CRUD, filtros, paginação, joins, unicidade, referências e cascatas sem depender do Turso remoto.

Os jobs de testes rodam em paralelo: se um falhar, o outro continua e o resultado fica visível separadamente no GitHub.

### 3. Build

Como a API é Express/Node e não tem bundler, o "build" valida o que seria necessário para rodar em produção:

```bash
npm ci --omit=dev   # somente dependências de produção
npm run build       # node scripts/build-check.js
```

O script [`scripts/build-check.js`](../scripts/build-check.js) importa `src/app.js`, carregando rotas, controllers, services, models, schemas e configurações. Se houver erro de sintaxe, import quebrado ou dependência ausente, o job falha.

Esse job depende do sucesso dos testes unitários e de integração.

### 4. Smoke test (API + Turso local)

Usa um arquivo SQLite local (`file:./ci.db`), sem depender do Turso remoto, e valida a aplicação de ponta a ponta:

1. `npm ci`
2. `npm run db:setup` (schema + seed)
3. Inicia `node server.js` em background
4. Faz polling em `GET /api/health` por até 30 segundos, exigindo `200`
5. Executa `npm run smoke`, que valida:
   - listagem de livros com `Author` e `Category`;
   - login de usuário e admin;
   - listagem de usuários sem o campo `password`;
   - listagem de cópias disponíveis;
   - criação de reserva, confirmação de retirada e atualização da cópia para `BORROWED`.
6. Encerra o processo da API ao final

Variáveis usadas no job:

| Variável | Valor |
|----------|-------|
| `TURSO_DATABASE_URL` | `file:./ci.db` |
| `JWT_SECRET` | `ci-secret` |
| `NODE_ENV` | `test` |
| `PORT` | `3333` |

Esse job também depende do sucesso dos testes unitários e de integração.

### 5. Migrate & seed (Turso)

Roda em **push para a `main`** e em execução manual na `main`. Usa os secrets do repositório:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Passos:

1. Verifica se os dois secrets existem. Se faltar algum, registra um aviso e ignora a etapa (o deploy também fica bloqueado).
2. `npm ci`
3. `npm run db:migrate`
4. `npm run db:seed` — idempotente; em execução manual pode ser desmarcado pelo input `seed`
5. `npm run db:check` — confirma que todas as tabelas obrigatórias existem

Esse job depende dos testes unitários e de integração.

### 6. Deploy no Render

Roda somente em **push para a `main`**, depois que testes unitários, testes de integração, build, smoke test e migrations passarem.

O job envia um `POST` para o **Deploy Hook** do Render, cuja URL fica no secret `RENDER_DEPLOY_HOOK_URL` do GitHub.

Se o secret não estiver configurado, o job **não falha**: registra um aviso e termina com sucesso. Assim, é possível manter o Auto-Deploy do Render ligado sem duplicar deploys.

> A execução manual (`workflow_dispatch`) não dispara o deploy, pois o job exige `github.event_name == 'push'`. Ela serve para rodar migrations/seed sob demanda.

## Configuração no GitHub

### Secrets do Turso

Em **Settings → Secrets and variables → Actions**, crie:

| Secret | Valor |
|--------|-------|
| `TURSO_DATABASE_URL` | `libsql://seu-banco-sua-org.turso.io` |
| `TURSO_AUTH_TOKEN` | token de leitura/escrita do banco |

Eles são usados pelo job **Migrate & seed (Turso)**. Sem eles, o job avisa e ignora a etapa, e o deploy não é disparado pelo Actions.

### Secret do deploy hook

1. No Render: serviço → **Settings → Deploy Hook** → copie a URL.
2. No GitHub: repositório → **Settings → Secrets and variables → Actions**.
3. **New repository secret**:
   - Nome: `RENDER_DEPLOY_HOOK_URL`
   - Valor: a URL copiada do Render.

A URL tem o formato:

```
https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyyy
```

Ela é secreta: qualquer pessoa com a URL consegue disparar um deploy. Se vazar, use **Regenerate Hook** no Render e atualize o secret.

### Proteção da branch (recomendado)

Em **Settings → Branches → Branch protection rules** para `main`, marque os checks do CI como obrigatórios antes do merge:

- `Testes unitários`
- `Testes de integração`
- `Build`
- `Smoke test (API + Turso local)`

Assim nenhum PR é mesclado com teste quebrado.

## Configuração no Render

| Configuração | Valor |
|--------------|-------|
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |
| **Node** | definido pelo [`.nvmrc`](../.nvmrc) (22) |
| **Variáveis** | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET` (e `FRONTEND_URLS` se necessário) |

O job de CI já aplica as migrations no Turso antes do deploy. Para rodar manualmente:

```bash
npm run db:migrate
# opcional: dados de demonstração
npm run db:seed
npm run db:check
```

### Auto-Deploy × Deploy Hook

| Auto-Deploy no Render | Secret no GitHub | Resultado |
|-----------------------|------------------|-----------|
| Ligado | Ausente | Render faz deploy a cada push; o CI só valida |
| Desligado | Configurado | Deploy só acontece após o CI passar |
| Ligado | Configurado | **Dois deploys por push** — evite |

Para o CI controlar o deploy:

1. No Render: **Settings → Auto-Deploy → No**.
2. Cadastre o secret `RENDER_DEPLOY_HOOK_URL` no GitHub.

## Acompanhando execuções

- Aba **Actions** do repositório → workflow **CI**.
- Badge no topo do [README](../README.md).
- Artefato **coverage** disponível na execução (7 dias).
- O job **Deploy no Render** mostra se o hook foi disparado ou ignorado por falta do secret.

## Rodando as mesmas etapas localmente

```bash
npm ci
npm run test:unit
npm run test:integration
npm run build
npm run db:check
```

Smoke test local com SQLite:

```bash
npm run db:setup
npm start
# em outro terminal:
npm run smoke
curl http://localhost:3333/api/health
```

Para testar contra o Turso remoto, preencha no `.env`:

```bash
TURSO_DATABASE_URL=libsql://seu-banco-sua-org.turso.io
TURSO_AUTH_TOKEN=seu-token
```

> No Windows/PowerShell: `Copy-Item .env.example .env` e edite o arquivo.

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| `TURSO_DATABASE_URL não configurada` | Variável ausente em produção | Cadastre a URL em **Settings → Environment Variables** |
| Job de migrations com aviso | Secrets do Turso ausentes no GitHub | Cadastre `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` em **Actions secrets** |
| Tabelas continuam ausentes após o CI | Job de migrations não rodou ou falhou | Confira o log de **Migrate & seed (Turso)** e rode o workflow manualmente |
| `401`/`403` ao acessar o Turso | `TURSO_AUTH_TOKEN` ausente ou inválido | Gere um novo token no Turso e atualize a variável |
| `no such table` | Schema não aplicado | Rode `npm run db:migrate` |
| `/api/health` retorna `503` | API no ar, banco indisponível | Verifique URL, token e migrations |
| Seed não insere nada | Banco já possui dados | Comportamento esperado (seed idempotente) |
| Deploy job não aparece | Evento não é push na `main` | Faça push na `main` ou ajuste o `if` do job |
| Deploy job passa com aviso | Secret não configurado | Cadastre `RENDER_DEPLOY_HOOK_URL` no GitHub |
| Dois deploys por push | Auto-Deploy ligado + secret configurado | Desligue o Auto-Deploy ou remova o secret |
| Build falha no `npm run build` | Import/sintaxe quebrados na aplicação | Rode `npm run build` localmente e corrija o erro |
