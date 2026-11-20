import { query } from '../config/database.js';
import {
  insertRow,
  nowIso,
  paginated,
  parsePagination,
  toNumber,
  updateRow,
} from './dbHelpers.js';

const mapAuthor = (row) => {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const listAuthors = async (pagination = {}) => {
  const paging = parsePagination(pagination);

  const countResult = await query('SELECT COUNT(*) AS total FROM "Authors"');
  const total = Number(countResult.rows[0]?.total || 0);

  const result = await query(
    `SELECT "id", "name", "createdAt", "updatedAt"
     FROM "Authors" ORDER BY "name" ASC LIMIT ? OFFSET ?`,
    [paging.limit, paging.offset]
  );

  return paginated(result.rows.map(mapAuthor), paging, total);
};

export const findAuthor = async (id) => {
  const result = await query(
    'SELECT "id", "name", "createdAt", "updatedAt" FROM "Authors" WHERE "id" = ?',
    [id]
  );

  return mapAuthor(result.rows[0]);
};

export const addAuthor = async (payload) => {
  const createdAt = nowIso();
  const id = await insertRow('Authors', {
    name: payload.name,
    createdAt,
    updatedAt: createdAt,
  });

  return { id, name: payload.name, createdAt, updatedAt: createdAt };
};

export const updateAuthor = async (id, updates) => {
  const updated = await updateRow('Authors', id, updates, ['name']);

  if (!updated) return null;

  return findAuthor(id);
};

export const removeAuthor = async (id) => {
  const books = await query(
    'SELECT COUNT(*) AS total FROM "Books" WHERE "authorId" = ?',
    [id]
  );

  if (Number(books.rows[0]?.total || 0) > 0) {
    const err = new Error('Não é possível remover um autor com livros cadastrados');
    err.name = 'ForeignKeyConstraintError';
    throw err;
  }

  const result = await query('DELETE FROM "Authors" WHERE "id" = ?', [id]);
  return result.rowsAffected > 0;
};
