import { createClient } from '@libsql/client';

// Turso fala libSQL (SQLite). Em produção use a URL e o token do banco:
//   TURSO_DATABASE_URL=libsql://seu-banco-sua-org.turso.io
//   TURSO_AUTH_TOKEN=...
// Sem essas variáveis, o desenvolvimento local usa um arquivo SQLite.
const clean = (value) => (typeof value === 'string' ? value.trim() : value);

const url =
  clean(process.env.TURSO_DATABASE_URL) ||
  'file:./biblioteca.db';

const authToken = clean(process.env.TURSO_AUTH_TOKEN) || undefined;

export const db = createClient({ url, authToken });

export const query = (sql, args = []) => db.execute({ sql, args });

export const batch = (statements) => db.batch(statements);

export const pingDatabase = async () => {
  await query('SELECT 1 AS ok');
};

export const closeDatabase = () => db.close();

export const isRemoteDatabase = /^(libsql|https?):\/\//i.test(url);

export default db;
