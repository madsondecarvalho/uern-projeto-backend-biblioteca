import { Sequelize } from 'sequelize';

const useSSL = process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL;
const sslOptions = useSSL
  ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
  : {};

let sequelize;

if (process.env.DATABASE_URL) {
  // Provedores como Neon / Supabase / Render fornecem uma URL única
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    ...sslOptions,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'biblioteca_dev',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || null,
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false,
      ...sslOptions,
    }
  );
}

export default sequelize;
