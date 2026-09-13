import app from '../src/app.js';
import sequelize from '../src/config/database.js';

// Duração máxima da function (plano hobby: máx. 10s).
export const maxDuration = 10;

// Sem este listener, uma promise rejeitada fora do try/catch derruba o
// processo Node e a Vercel responde FUNCTION_INVOCATION_FAILED sem detalhe.
// Com ele, o motivo aparece nos logs (aba Logs/Functions no dashboard).
process.on('unhandledRejection', (reason) => {
  console.error('[api] unhandledRejection:', reason);
});

// Na Vercel, req/res são os objetos RAW do Node (http.IncomingMessage /
// http.ServerResponse) — NÃO têm .status() nem .json() do Express.
// Usar esses helpers aqui lança TypeError dentro do handler async →
// unhandled rejection → processo morre → FUNCTION_INVOCATION_FAILED.
function sendJson(res, status, obj) {
  if (!res.headersSent) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(JSON.stringify(obj));
}

let dbReady = null;
const DB_TIMEOUT_MS = Number(process.env.DB_CONNECT_TIMEOUT_MS) || 8000;

async function ensureDb() {
  if (!dbReady) {
    const hasDbConfig = !!process.env.DATABASE_URL || !!process.env.DB_HOST;
    if (!hasDbConfig) {
      throw new Error(
        'DATABASE_URL (ou DB_HOST) não configurada na Vercel → Settings → Environment Variables'
      );
    }
    dbReady = sequelize.authenticate().then(() => {
      console.log('[api] PostgreSQL conectado');
    }).catch((err) => {
      // NÃO cacheia a falha: banco serverless (Neon free) "dorme" e o primeiro
      // request após idle falha; a próxima invocação deve tentar de novo.
      dbReady = null;
      throw err;
    });
  }

  let timer;
  try {
    await Promise.race([
      dbReady,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const err = new Error(
            `Timeout ao conectar ao banco após ${DB_TIMEOUT_MS}ms — verifique DATABASE_URL (use a URL do pooler), SSL e se o IP da Vercel é aceito`
          );
          err.code = 'DB_CONNECT_TIMEOUT';
          reject(err);
        }, DB_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  // Diagnóstico: '/' responde SEM banco. Se '/' abre e o resto crasha, o
  // runtime está OK e o problema é o banco. Se '/' crasha, é import/runtime.
  if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
    try {
      await ensureDb();
      return sendJson(res, 200, { status: 'ok', db: 'connected' });
    } catch (err) {
      console.error('[api] DB fail:', err?.code || err?.name, '-', err?.message);
      // Mesmo sem banco, prova que a function executou (não crashou).
      return sendJson(res, 200, { status: 'up', db: 'disconnected', detail: err?.message });
    }
  }

  try {
    await ensureDb();
  } catch (err) {
    console.error('[api] DB fail:', err?.code || err?.name, '-', err?.message);
    const status = err?.code === 'DB_CONNECT_TIMEOUT' ? 504 : 500;
    return sendJson(res, status, { error: 'Erro de conexão com o banco de dados', detail: err?.message });
  }

  return app(req, res);
}
