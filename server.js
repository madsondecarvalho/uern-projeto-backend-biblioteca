import express from 'express';
import bookRoutes from './src/routes/bookRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3333;

app.use(express.json());
app.use('/api', bookRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado' });
});

app.listen(PORT, () => {
  console.log(`Biblioteca API rodando em http://localhost:${PORT}`);
});
