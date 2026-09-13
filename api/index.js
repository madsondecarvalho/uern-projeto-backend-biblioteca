import app from '../src/app.js';
import sequelize from '../src/config/database.js';

let dbReady = null;
let dbError = null;

async function ensureDb() {
  if (dbError) throw dbError;
  if (!dbReady) {
    const hasDbConfig = !!process.env.DATABASE_URL || !!process.env.DB_HOST;
    if (!hasDbConfig) {
      dbError = new Error('DATABASE_URL (ou DB_HOST) não configurada na Vercel');
      throw dbError;
    }
    dbReady = sequelize.authenticate().catch((err) => {
      dbError = err;
      dbReady = null;
      throw err;
    });
  }
  return dbReady;
}

export default async function handler(req, res) {
  // Healthcheck sem banco — útil p/ confirmar que a function ao menos sobe
  if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
    try {
      await ensureDb();
      return res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (err) {
      console.error('DB error on healthcheck:', err?.message);
      return res.status(500).json({ status: 'error', error: 'Erro de conexão com o banco de dados', detail: err?.message });
    }
  }

  try {
    await ensureDb();
  } catch (err) {
    console.error('Erro ao conectar ao Postgres:', err?.message || err);
    return res.status(500).json({ error: 'Erro de conexão com o banco de dados', detail: err?.message });
  }

  return app(req, res);
}
