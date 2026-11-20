# Banco de dados — Turso/libSQL

A API usa **Turso**, um banco SQLite hospedado que fala **libSQL**. Não há mais PostgreSQL nem Sequelize.

## Modos de uso

| Modo | `TURSO_DATABASE_URL` | `TURSO_AUTH_TOKEN` |
|------|----------------------|--------------------|
| Local | `file:./biblioteca.db` | vazio |
| Turso | `libsql://seu-banco-sua-org.turso.io` | token do banco |

Sem `TURSO_DATABASE_URL`, o projeto usa `file:./biblioteca.db` automaticamente em desenvolvimento.

## Configuração no Turso

1. Acesse o [dashboard do Turso](https://turso.tech) e crie um banco.
2. Copie a URL do banco (`libsql://...`).
3. Crie um token de acesso com permissão de leitura/escrita.
4. Preencha no `.env` (ou nas variáveis do Render):

```bash
TURSO_DATABASE_URL=libsql://seu-banco-sua-org.turso.io
TURSO_AUTH_TOKEN=seu-token
```

> O token é secreto. Não commite o `.env` nem coloque o token no código.

## Schema e dados

Os scripts usam SQL parametrizado e são idempotentes:

```bash
npm run db:migrate   # cria tabelas e índices que ainda não existem
npm run db:seed      # insere dados de demonstração se o banco estiver vazio
npm run db:setup     # db:migrate + db:seed
```

Para aplicar no Turso, rode com as variáveis de ambiente configuradas:

```bash
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npm run db:migrate
```

No Windows/PowerShell, defina com `$env:TURSO_DATABASE_URL='...'` antes do comando.

## Tabelas

| Tabela | Conteúdo |
|--------|----------|
| `Authors` | Autores (nome único) |
| `Categories` | Categorias (nome único) |
| `Users` | Usuários, senha com hash e role (`user`/`admin`) |
| `Books` | Livros, com `authorId` e `categoryId` |
| `Copies` | Cópias físicas, com código único e status |
| `Reservations` | Reservas, com status e janela de 24h |

O schema completo está em [`scripts/db/schema.js`](../scripts/db/schema.js).

## Migração de dados do PostgreSQL

Os dados do banco PostgreSQL antigo **não são migrados automaticamente**. Opções:

1. Rodar `npm run db:seed` para recriar os dados de demonstração.
2. Exportar os dados do Postgres e importar via script/SQL no Turso.
3. Criar um script de migração específico para o volume de dados atual.

## Comportamento das remoções

Como o libSQL pode rodar com `PRAGMA foreign_keys` desabilitado, a aplicação garante a integridade:

- remover livro → remove cópias e reservas;
- remover cópia → remove reservas;
- remover usuário → remove reservas;
- remover categoria → desvincula os livros (`categoryId = null`);
- remover autor com livros → operação rejeitada.

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| `no such table` | Rode `npm run db:migrate` |
| `401`/`403` do Turso | Verifique `TURSO_AUTH_TOKEN` |
| `TURSO_DATABASE_URL não configurada` | Configure a variável no ambiente |
| Seed não insere dados | Esperado se o banco já tiver dados |
| `/api/health` com `database: "down"` | Verifique URL, token e conectividade |
