import app from '../src/app.js';
import sequelize from '../src/config/database.js';

let dbReady = null;

async function ensureDb() {
  if (!dbReady) {
    dbReady = sequelize.authenticate().then(() => {
      console.log('Conectado ao PostgreSQL (Vercel)');
    });
  }
  return dbReady;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (err) {
    console.error('Erro ao conectar ao Postgres:', err);
    return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
  }
  return app(req, res);
}
