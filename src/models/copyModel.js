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

const COPY_FIELDS = ['code', 'status', 'bookId'];

const SELECT_COPY = `
  SELECT cp."id", cp."code", cp."status", cp."bookId",
         cp."createdAt", cp."updatedAt",
         b."id" AS "book_id", b."title" AS "book_title", b."year" AS "book_year",
         b."categoryId" AS "book_categoryId", b."authorId" AS "book_authorId",
         b."createdAt" AS "book_createdAt", b."updatedAt" AS "book_updatedAt"
  FROM "Copies" cp
  LEFT JOIN "Books" b ON b."id" = cp."bookId"
`;

const mapBook = (row) => {
  if (row.book_id == null) return null;

  return {
    id: toNumber(row.book_id),
    title: row.book_title,
    year: toNumber(row.book_year),
    categoryId: toNumber(row.book_categoryId),
    authorId: toNumber(row.book_authorId),
    createdAt: row.book_createdAt,
    updatedAt: row.book_updatedAt,
  };
};

const mapCopy = (row) => {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    code: row.code,
    status: row.status,
    bookId: toNumber(row.bookId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    Book: mapBook(row),
  };
};

const mapCopyBasic = (row) => {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    code: row.code,
    status: row.status,
    bookId: toNumber(row.bookId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const listCopies = async (filters = {}, pagination = {}) => {
  const conditions = [];
  const args = [];

  if (filters.bookId) {
    conditions.push('cp."bookId" = ?');
    args.push(Number(filters.bookId));
  }

  if (filters.status) {
    conditions.push('cp."status" = ?');
    args.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const paging = parsePagination(pagination);

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM "Copies" cp ${where}`,
    args
  );
  const total = Number(countResult.rows[0]?.total || 0);

  const result = await query(
    `${SELECT_COPY} ${where} ORDER BY cp."id" ASC LIMIT ? OFFSET ?`,
    [...args, paging.limit, paging.offset]
  );

  return paginated(result.rows.map(mapCopy), paging, total);
};

export const findCopy = async (id) => {
  const result = await query(`${SELECT_COPY} WHERE cp."id" = ?`, [id]);
  return mapCopy(result.rows[0]);
};

export const findCopyByCode = async (code) => {
  const result = await query('SELECT * FROM "Copies" WHERE "code" = ?', [code]);
  return mapCopyBasic(result.rows[0]);
};

export const addCopy = async (payload) => {
  await assertRowExists('Books', payload.bookId, 'Livro não encontrado');

  const createdAt = nowIso();
  const copy = {
    code: payload.code,
    status: payload.status || 'AVAILABLE',
    bookId: payload.bookId,
    createdAt,
    updatedAt: createdAt,
  };

  const id = await insertRow('Copies', copy);

  return {
    id,
    code: copy.code,
    status: copy.status,
    bookId: toNumber(copy.bookId),
    createdAt,
    updatedAt: createdAt,
  };
};

export const updateCopy = async (id, updates) => {
  if (updates.bookId !== undefined) {
    await assertRowExists('Books', updates.bookId, 'Livro não encontrado');
  }

  const updated = await updateRow('Copies', id, updates, COPY_FIELDS);

  if (!updated) return null;

  return findCopy(id);
};

export const removeCopy = async (id) => {
  const results = await batch([
    { sql: 'DELETE FROM "Reservations" WHERE "copyId" = ?', args: [id] },
    { sql: 'DELETE FROM "Copies" WHERE "id" = ?', args: [id] },
  ]);

  return results[1].rowsAffected > 0;
};
