import '../../src/config/loadEnv.js';
import bcrypt from 'bcryptjs';
import { batch, closeDatabase, query } from '../../src/config/database.js';
import { AUTHORS, BOOKS, CATEGORIES, COPIES, USERS } from './seedData.js';

const now = new Date().toISOString();

try {
  const state = await query(`
    SELECT
      (SELECT COUNT(*) FROM "Authors") AS authors,
      (SELECT COUNT(*) FROM "Categories") AS categories,
      (SELECT COUNT(*) FROM "Books") AS books,
      (SELECT COUNT(*) FROM "Users") AS users,
      (SELECT COUNT(*) FROM "Copies") AS copies
  `);

  const existing = state.rows[0];
  const total = Object.values(existing).reduce(
    (sum, value) => sum + Number(value),
    0
  );

  if (total > 0) {
    console.log('Seed ignorado: o banco já possui dados.');
  } else {
    const hashedPasswords = await Promise.all(
      USERS.map((user) => bcrypt.hash(user.password, 10))
    );

    const statements = [];

    AUTHORS.forEach((name, index) => {
      statements.push({
        sql: `INSERT INTO "Authors" ("id", "name", "createdAt", "updatedAt")
              VALUES (?, ?, ?, ?)`,
        args: [index + 1, name, now, now],
      });
    });

    CATEGORIES.forEach((name, index) => {
      statements.push({
        sql: `INSERT INTO "Categories" ("id", "name", "createdAt", "updatedAt")
              VALUES (?, ?, ?, ?)`,
        args: [index + 1, name, now, now],
      });
    });

    BOOKS.forEach((book, index) => {
      statements.push({
        sql: `INSERT INTO "Books"
                ("id", "title", "year", "categoryId", "authorId", "createdAt", "updatedAt")
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          index + 1,
          book.title,
          book.year,
          book.categoryId,
          book.authorId,
          now,
          now,
        ],
      });
    });

    USERS.forEach((user, index) => {
      statements.push({
        sql: `INSERT INTO "Users"
                ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          index + 1,
          user.name,
          user.email,
          hashedPasswords[index],
          user.role,
          now,
          now,
        ],
      });
    });

    COPIES.forEach((copy) => {
      statements.push({
        sql: `INSERT INTO "Copies"
                ("code", "status", "bookId", "createdAt", "updatedAt")
              VALUES (?, ?, ?, ?, ?)`,
        args: [copy.code, copy.status, copy.bookId, now, now],
      });
    });

    await batch(statements);

    console.log(
      `Seed concluído: ${AUTHORS.length} autores, ${CATEGORIES.length} categorias, ` +
      `${BOOKS.length} livros, ${USERS.length} usuários e ${COPIES.length} cópias.`
    );
  }
} catch (err) {
  console.error('Erro ao executar o seed:', err?.message);
  console.error('Se as tabelas não existirem, rode primeiro: npm run db:migrate');
  process.exitCode = 1;
} finally {
  closeDatabase();
}
