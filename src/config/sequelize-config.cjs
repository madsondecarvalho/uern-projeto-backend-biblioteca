module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'biblioteca_dev',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
  },
};
