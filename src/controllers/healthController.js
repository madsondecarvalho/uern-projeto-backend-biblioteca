import sequelize from '../config/database.js';

// Health check: confirma que a API está no ar e que o PostgreSQL responde.
// Retorna 200 quando tudo está ok e 503 quando o banco está indisponível,
// para que monitoramentos/load balancers detectem o problema.
export const healthCheck = async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const health = {
    status: 'ok',
    database: 'up',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  try {
    await sequelize.authenticate();
    return res.json(health);
  } catch (err) {
    console.error('[health] banco indisponível:', err?.message);
    health.status = 'degraded';
    health.database = 'down';
    return res.status(503).json(health);
  }
};
