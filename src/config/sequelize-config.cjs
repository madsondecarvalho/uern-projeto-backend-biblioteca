// Config usada pelo sequelize-cli (migrate/seed).
// Aceita DATABASE_URL (ex.: Prisma/Neon/Supabase) com prioridade sobre as
// variáveis separadas — sem isso, rodar `DATABASE_URL=... npx sequelize-cli
// db:migrate` ignorava a URL e tentava localhost.
const clean = (v) => (typeof v === 'string' ? v.trim() : v);

let databaseUrl = clean(process.env.DATABASE_URL);
let dbHost = clean(process.env.DB_HOST);
let dbPort = Number(clean(process.env.DB_PORT)) || 5432;

if (!databaseUrl && dbHost && dbHost.includes('://')) {
  databaseUrl = dbHost;
  dbHost = null;
}
if (dbHost && !dbHost.includes('://') && dbHost.includes(':') && !dbHost.startsWith('[')) {
  const idx = dbHost.lastIndexOf(':');
  const maybePort = Number(dbHost.slice(idx + 1));
  if (Number.isInteger(maybePort) && maybePort > 0) {
    dbPort = maybePort;
    dbHost = dbHost.slice(0, idx).trim();
  }
}

const dbSSL = process.env.DB_SSL !== 'false';
const sslOptions = dbSSL
  ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
  : {};

const fromUrl = databaseUrl
  ? { url: databaseUrl, dialect: 'postgres', ...sslOptions }
  : null;

module.exports = {
  development: fromUrl || {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'biblioteca_dev',
    host: dbHost || '127.0.0.1',
    port: dbPort,
    dialect: 'postgres',
  },
  test: fromUrl || {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'biblioteca_test',
    host: dbHost || '127.0.0.1',
    port: dbPort,
    dialect: 'postgres',
  },
  production: fromUrl || {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'biblioteca_prod',
    host: dbHost || '127.0.0.1',
    port: dbPort,
    dialect: 'postgres',
    ...sslOptions,
  },
};
