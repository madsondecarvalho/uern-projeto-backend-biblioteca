import { existsSync } from 'node:fs';

// Carrega .env em desenvolvimento local. Em produção (Render/Vercel) as
// variáveis vêm do painel e normalmente não existe arquivo .env.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}
