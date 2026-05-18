import express from 'express';
import swaggerUi from 'swagger-ui-express';
import sequelize from './src/config/database.js';
import swaggerSpec from './src/config/swagger.js';
import bookRoutes from './src/routes/bookRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import authorRoutes from './src/routes/authorRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3333;

app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', authRoutes);
app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', authorRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

sequelize.authenticate()
  .then(() => {
    console.log('Conectado ao MySQL');
    app.listen(PORT, () => {
      console.log(`Biblioteca API rodando em http://localhost:${PORT}`);
      console.log(`Swagger UI em http://localhost:${PORT}/api/docs`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1);
  });
