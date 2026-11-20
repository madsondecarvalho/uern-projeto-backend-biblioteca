import './src/config/loadEnv.js';
import app from './src/app.js';
import { closeDatabase, pingDatabase } from './src/config/database.js';

const PORT = Number(process.env.PORT) || 3333;

pingDatabase()
  .then(() => {
    console.log('Conectado ao Turso (libSQL)');
    const server = app.listen(PORT, () => {
      console.log(`Biblioteca API rodando em http://localhost:${PORT}`);
      console.log(`Swagger UI em http://localhost:${PORT}/api/docs`);
    });

    const shutdown = () => {
      server.close(() => {
        closeDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((err) => {
    console.error('Erro ao conectar ao Turso:', err);
    process.exit(1);
  });
