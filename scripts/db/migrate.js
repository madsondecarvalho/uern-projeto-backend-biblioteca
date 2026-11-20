import '../../src/config/loadEnv.js';
import { batch, closeDatabase, isRemoteDatabase } from '../../src/config/database.js';
import { SCHEMA_STATEMENTS } from './schema.js';

const target = isRemoteDatabase
  ? 'Turso remoto'
  : process.env.TURSO_DATABASE_URL || 'file:./biblioteca.db';

console.log(`Aplicando schema em: ${target}`);

try {
  await batch(SCHEMA_STATEMENTS);
  console.log(`Schema aplicado com sucesso (${SCHEMA_STATEMENTS.length} comandos).`);
} catch (err) {
  console.error('Erro ao aplicar o schema:', err?.message);
  process.exitCode = 1;
} finally {
  closeDatabase();
}
