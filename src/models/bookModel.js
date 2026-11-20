import { batch, query } from '../config/database.js';
import {
  assertRowExists,
  insertRow,
  nowIso,
  paginated,
  parsePagination,
  toNumber,
  updateRow,
} from './dbHelpers.js';

const BOOK_FIELDS = ['title', 'year', 'categoryId', 'authorId'];

const SELECT_BOOK = `
  SELECT b."id", b."title", b."year", b."categoryId", b."authorId",
         b."createdAt", b."updatedAt",
         c."id" AS "category_id", c."name" AS "category_name",
         a."id" AS "author_id", a."name" AS "author_name"
  FROM "Books" b
  LEFT JOIN "Categories" c ON c."id" = b."categoryId"
  LEFT JOIN "Authors" a ON a."id" = b."authorId"
`;

const mapBook = (row) => {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    title: row.title,
    year: toNumber(row.year),
    categoryId: toNumber(row.categoryId),
    authorId: toNumber(row.authorId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    Category: row.category_id == null
      ? null
      : { id: toNumber(row.category_id), name: row.category_name },
    Author: row.author_id == null
      ? null
      : { id: toNumber(row.author_id), name: row.author_name },
  };
};

export const listBooks = async (filters = {}, pagination = {}) => {
  const conditions = [];
  const args = [];

  if (filters.categoryId) {
    conditions.push('b."categoryId" = ?');
    args.push(Number(filters.categoryId));
  }

  if (filters.authorId) {
    conditions.push('b."authorId" = ?');
    args.push(Number(filters.authorId));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const paging = parsePagination(pagination);

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM "Books" b ${where}`,
    args
  );
  const total = Number(countResult.rows[0]?.total || 0);

  const result = await query(
    `${SELECT_BOOK} ${where} ORDER BY b."id" ASC LIMIT ? OFFSET ?`,
    [...args, paging.limit, paging.offset]
  );

  return paginated(result.rows.map(mapBook), paging, total);
};

export const findBook = async (id) => {
  const result = await query(`${SELECT_BOOK} WHERE b."id" = ?`, [id]);
  return mapBook(result.rows[0]);
};

export const addBook = async (payload) => {
  await assertRowExists('Authors', payload.authorId, 'Autor não encontrado');

  if (payload.categoryId != null) {
    await assertRowExists('Categories', payload.categoryId, 'Categoria não encontrada');
  }

  const createdAt = nowIso();
  const book = {
    title: payload.title,
    year: payload.year,
    categoryId: payload.categoryId ?? null,
    authorId: payload.authorId,
    createdAt,
    updatedAt: createdAt,
  };

  const id = await insertRow('Books', book);

  return {
    id,
    title: book.title,
    year: toNumber(book.year),
    categoryId: toNumber(book.categoryId),
    authorId: toNumber(book.authorId),
    createdAt,
    updatedAt: createdAt,
  };
};

export const updateBook = async (id, updates) => {
  if (updates.authorId !== undefined) {
    await assertRowExists('Authors', updates.authorId, 'Autor não encontrado');
  }

  if (updates.categoryId != null) {
    await assertRowExists('Categories', updates.categoryId, 'Categoria não encontrada');
  }

  const updated = await updateRow('Books', id, updates, BOOK_FIELDS);

  if (!updated) return null;

  return findBook(id);
};

export const removeBook = async (id) => {
  const results = await batch([
    {
      sql: `DELETE FROM "Reservations"
            WHERE "copyId" IN (SELECT "id" FROM "Copies" WHERE "bookId" = ?)`,
      args: [id],
    },
    { sql: 'DELETE FROM "Copies" WHERE "bookId" = ?', args: [id] },
    { sql: 'DELETE FROM "Books" WHERE "id" = ?', args: [id] },
  ]);

  return results[2].rowsAffected > 0;
};
