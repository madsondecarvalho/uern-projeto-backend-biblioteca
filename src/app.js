import express from 'express';
import cors from 'cors';
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

// Spec OpenAPI em JSON — o Swagger UI (via CDN) busca daqui.
// Servir o JSON pelo Express funciona em qualquer ambiente (serverless ou não).
app.get('/api/docs.json', (req, res) => {
  res.json({
    ...swaggerSpec,
    servers: [{ url: API_URL, description: 'Servidor' }],
  });
});

// Página do Swagger UI com assets via CDN (unpkg).
// MOTIVO: o swagger-ui-express serve os .js/.css lendo node_modules do disco em
// runtime; no bundle mínimo da Vercel esses arquivos não existem, cada asset
// caía no HTML da página e o navegador quebrava com "Unexpected token '<'".
// Com CDN, a function entrega só HTML + JSON — nada de arquivo estático.
const SWAGGER_UI_VERSION = '5.32.5';
const docsHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Biblioteca API - Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/api/docs.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      });
    };
  </script>
</body>
</html>`;

app.get(['/api/docs', '/api/docs/'], (req, res) => {
  res.type('html').send(docsHtml);
});

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
