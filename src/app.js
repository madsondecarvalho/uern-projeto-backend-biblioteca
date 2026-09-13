import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import copyRoutes from './routes/copyRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

const app = express();
const API_URL = process.env.API_URL || 'http://localhost:3333/api';

app.set('trust proxy', 1);
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Biblioteca API rodando. Docs em /api/docs' });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup({
  ...swaggerSpec,
  servers: [{ url: API_URL, description: 'Servidor' }]
}));
app.use('/api', authRoutes);
app.use('/api', bookRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', authorRoutes);
app.use('/api', copyRoutes);
app.use('/api', reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

export default app;
