// A API Express não passa por compilação. Este "build" garante que todas as
// dependências de produção estão presentes e que a aplicação (rotas,
// controllers, services, models e configs) carrega sem erros de import/sintaxe.
import '../src/app.js';

console.log('Build OK: aplicação carregada sem erros.');
