import express from 'express';
import sequelize from './src/config/database.js';
import bookRoutes from './src/routes/bookRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3333;

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', bookRoutes);
app.use('/api', userRoutes);

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
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1);
  });
