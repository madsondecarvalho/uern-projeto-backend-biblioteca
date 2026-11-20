# CI/CD — GitHub Actions + Render

O projeto usa **GitHub Actions** para validar cada alteração e, opcionalmente, controlar o deploy no **Render**.

O pipeline está definido em [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Quando o pipeline roda

| Evento | Quando acontece |
|--------|-----------------|
| `push` | Apenas na branch `main` |
| `pull_request` | Ao abrir ou atualizar um pull request |
| `workflow_dispatch` | Execução manual pela aba **Actions** |

Uma nova execução no mesmo branch cancela a anterior ainda em andamento (`concurrency`), evitando jobs duplicados.

## Fluxo

```
push na main / pull request
        │
        ▼
┌──────────────────┐
│ Testes unitários │  npm run test:ci (Jest + cobertura)
└────────┬─────────┘
         │ sucesso
         ├───────────────┐
         ▼               ▼
┌──────────────┐  ┌──────────────────────────┐
│    Build     │  │ Smoke test (PostgreSQL)  │
│ npm ci       │  │ migrations + API + /health│
│ --omit=dev   │  └────────────┬─────────────┘
│ npm run build│               │
└──────┬───────┘               │
       └───────────┬───────────┘
                   ▼
        ┌─────────────────────┐
        │ Deploy no Render    │  somente push na main
        │ deploy hook (secret)│
        └─────────────────────┘
```

## Jobs

### 1. Testes unitários

Executa a suíte Jest completa com cobertura:

```bash
npm ci
npm run test:ci   # jest --runInBand --coverage
```

O relatório HTML/JSON gerado em `coverage/` é publicado como artefato por 7 dias na execução do workflow.

Os testes usam mocks para o banco, portanto esse job **não precisa de PostgreSQL**.

### 2. Build

Como a API é Express/Node e não tem bundler, o "build" valida o que seria necessário para rodar em produção:

```bash
npm ci --omit=dev   # somente dependências de produção
npm run build       # node scripts/build-check.js
```

O script [`scripts/build-check.js`](../scripts/build-check.js) importa `src/app.js`, carregando rotas, controllers, services, models, schemas e configurações. Se houver erro de sintaxe, import quebrado ou dependência ausente, o job falha.

Esse job depende do sucesso dos testes.

### 3. Smoke test (API + PostgreSQL)

Sobe um container PostgreSQL 16 como *service* do GitHub Actions e valida a aplicação de ponta a ponta:

1. `npm ci`
2. `npx sequelize-cli db:migrate`
3. Inicia `node server.js` em background
4. Faz polling em `GET /api/health` por até 30 segundos
5. Exige resposta `200` (API **e** banco operacionais)
6. Encerra o processo da API ao final

Variáveis usadas no job:

| Variável | Valor |
|----------|-------|
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `biblioteca_ci` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `DB_SSL` | `false` |
| `JWT_SECRET` | `ci-secret` |
| `NODE_ENV` | `test` |
| `PORT` | `3333` |

> `DB_SSL=false` é obrigatório porque o PostgreSQL do service roda sem SSL.

Esse job também depende do sucesso dos testes.

### 4. Deploy no Render

Roda somente em **push para a `main`**, depois que testes, build e smoke test passarem.

O job envia um `POST` para o **Deploy Hook** do Render, cuja URL fica no secret `RENDER_DEPLOY_HOOK_URL` do GitHub.

Se o secret não estiver configurado, o job **não falha**: registra um aviso e termina com sucesso. Assim, é possível manter o Auto-Deploy do Render ligado sem duplicar deploys.

> A execução manual (`workflow_dispatch`) não dispara o deploy, pois o job exige `github.event_name == 'push'`.

## Configuração no GitHub

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
- `Build`
- `Smoke test (API + PostgreSQL)`

Assim nenhum PR é mesclado com teste quebrado.

## Configuração no Render

| Configuração | Valor |
|--------------|-------|
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |
| **Node** | definido pelo [`.nvmrc`](../.nvmrc) (22) |

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
npm run test:ci
npm run build
```

Smoke test local com PostgreSQL via Docker:

```bash
docker compose up -d postgres
DB_SSL=false npx sequelize-cli db:migrate
npm start
curl http://localhost:3333/api/health
```

> No Windows/PowerShell, defina as variáveis com `$env:DB_SSL='false'` antes dos comandos.

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| Smoke test falha com `ECONNREFUSED` | PostgreSQL ainda não subiu | O service já tem health check; verifique `DB_HOST`/`DB_PORT` |
| Migration falha com erro de SSL | `DB_SSL` não é `false` | Defina `DB_SSL: 'false'` no job |
| `/api/health` retorna `503` | API no ar, banco indisponível | Verifique conexão, credenciais e migrations |
| Deploy job não aparece | Evento não é push na `main` | Faça push na `main` ou ajuste o `if` do job |
| Deploy job passa com aviso | Secret não configurado | Cadastre `RENDER_DEPLOY_HOOK_URL` no GitHub |
| Dois deploys por push | Auto-Deploy ligado + secret configurado | Desligue o Auto-Deploy ou remova o secret |
| Build falha no `npm run build` | Import/sintaxe quebrados na aplicação | Rode `npm run build` localmente e corrija o erro |
