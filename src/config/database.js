import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'biblioteca_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;
