import { Sequelize } from 'sequelize';

// Imports estáticos intencionais (sem uso direto no código): o Sequelize carrega
// 'pg'/'pg-hstore' via require() DINÂMICO com nome de variável, que o file-tracer
// da Vercel (nft) não consegue detectar. Sem estes imports, esses pacotes ficam
// de fora do bundle e o runtime quebra com "Please install pg package manually".
import 'pg';
import 'pg-hstore';

// Limpa espaços acidentais ao colar valores do dashboard (causa comum de
// "getaddrinfo ENOTFOUND" — um espaço/quebra de linha já invalida o host).
const clean = (v) => (typeof v === 'string' ? v.trim() : v);

let databaseUrl = clean(process.env.DATABASE_URL);
let dbHost = clean(process.env.DB_HOST);

// Rede de segurança: URL completa colada por engano no campo DB_HOST.
if (!databaseUrl && dbHost && dbHost.includes('://')) {
  console.warn('[db] valor de DB_HOST parece uma URL — usando como DATABASE_URL');
  databaseUrl = dbHost;
  dbHost = null;
}

// Rede de segurança: "host:porta" colado junto no DB_HOST (ex. "db.prisma.io:5432").
// O pg resolveria a string inteira como hostname → ENOTFOUND.
let dbPort = Number(clean(process.env.DB_PORT)) || 5432;
if (dbHost && !dbHost.includes('://') && dbHost.includes(':') && !dbHost.startsWith('[')) {
  const idx = dbHost.lastIndexOf(':');
  const maybePort = Number(dbHost.slice(idx + 1));
  if (Number.isInteger(maybePort) && maybePort > 0) {
    console.warn(`[db] separando porta de DB_HOST ("${dbHost}")`);
    dbPort = maybePort;
    dbHost = dbHost.slice(0, idx).trim();
  }
}

const useSSL = process.env.DB_SSL === 'true' || !!databaseUrl;

// Pool pequeno + timeouts curtos: em serverless (Vercel) a function morre em ~10s.
// Sem isso, um host inalcançável trava a function até o timeout da plataforma,
// que responde com FUNCTION_INVOCATION_FAILED em vez de um JSON de erro.
const serverlessOptions = {
  pool: {
    max: 2, // poucas conexões por instância congelada/descongelada
    min: 0, // não segura conexão idle (cada uma custa no Postgres)
    acquire: 8000, // desiste de pegar conexão após 8s
    idle: 10000, // fecha conexão idle (Neon/Supabase derrubam idle mesmo)
    evict: 5000,
  },
  retry: { max: 1 }, // 1 tentativa: falhar rápido > travar a function
  dialectOptions: {
    connectionTimeoutMillis: 8000, // pg: 0 = SEM timeout (nunca use 0 em serverless)
    ...(useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {}),
  },
};

let sequelize;

if (databaseUrl) {
  // Provedores como Prisma / Neon / Supabase / Render fornecem uma URL única.
  // Em serverless, prefira a URL do POOLER (Prisma: pooled.db.prisma.io /
  // Neon: -pooler... / Supabase porta 6543).
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    ...serverlessOptions,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'biblioteca_dev',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || null,
    {
      host: dbHost || '127.0.0.1',
      port: dbPort,
      dialect: 'postgres',
      logging: false,
      ...serverlessOptions,
    }
  );
}

export default sequelize;
