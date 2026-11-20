import '../../src/config/loadEnv.js';
import { closeDatabase, query } from '../../src/config/database.js';

const REQUIRED_TABLES = [
  'Authors',
  'Books',
  'Categories',
  'Copies',
  'Reservations',
  'Users',
];

try {
  const { rows } = await query(
    `SELECT "name" FROM "sqlite_master"
     WHERE "type" = 'table' AND "name" NOT LIKE 'sqlite_%'
     ORDER BY "name"`
  );

  const found = new Set(rows.map((row) => row.name));
  const missing = REQUIRED_TABLES.filter((table) => !found.has(table));

  console.log(`Tabelas encontradas: ${rows.map((row) => row.name).join(', ') || 'nenhuma'}`);

  for (const table of REQUIRED_TABLES) {
    if (!found.has(table)) continue;

    const count = await query(`SELECT COUNT(*) AS "total" FROM "${table}"`);
    console.log(`- ${table}: ${Number(count.rows[0]?.total || 0)} registro(s)`);
  }

  if (missing.length > 0) {
    console.error(`Tabelas faltando: ${missing.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('Schema OK: todas as tabelas obrigatórias existem.');
  }
} catch (err) {
  console.error('Erro ao verificar o schema:', err?.message);
  process.exitCode = 1;
} finally {
  closeDatabase();
}
