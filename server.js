import app from './src/app.js';
import sequelize from './src/config/database.js';

const PORT = Number(process.env.PORT) || 3333;

sequelize.authenticate()
  .then(() => {
    console.log('Conectado ao PostgreSQL');
    app.listen(PORT, () => {
      console.log(`Biblioteca API rodando em http://localhost:${PORT}`);
      console.log(`Swagger UI em http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao Postgres:', err);
    process.exit(1);
  });
