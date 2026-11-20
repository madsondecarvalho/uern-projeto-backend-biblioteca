import { batch, query } from '../config/database.js';
import {
  insertRow,
  nowIso,
  paginated,
  parsePagination,
  toNumber,
  updateRow,
} from './dbHelpers.js';

const mapCategory = (row) => {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export const listCategories = async (pagination = {}) => {
  const paging = parsePagination(pagination);

  const countResult = await query('SELECT COUNT(*) AS total FROM "Categories"');
  const total = Number(countResult.rows[0]?.total || 0);

  const result = await query(
    `SELECT "id", "name", "createdAt", "updatedAt"
     FROM "Categories" ORDER BY "name" ASC LIMIT ? OFFSET ?`,
    [paging.limit, paging.offset]
  );

  return paginated(result.rows.map(mapCategory), paging, total);
};

export const findCategory = async (id) => {
  const result = await query(
    'SELECT "id", "name", "createdAt", "updatedAt" FROM "Categories" WHERE "id" = ?',
    [id]
  );

  return mapCategory(result.rows[0]);
};

export const addCategory = async (payload) => {
  const createdAt = nowIso();
  const id = await insertRow('Categories', {
    name: payload.name,
    createdAt,
    updatedAt: createdAt,
  });

  return { id, name: payload.name, createdAt, updatedAt: createdAt };
};

export const updateCategory = async (id, updates) => {
  const updated = await updateRow('Categories', id, updates, ['name']);

  if (!updated) return null;

  return findCategory(id);
};

export const removeCategory = async (id) => {
  const results = await batch([
    {
      sql: 'UPDATE "Books" SET "categoryId" = NULL, "updatedAt" = ? WHERE "categoryId" = ?',
      args: [nowIso(), id],
    },
    { sql: 'DELETE FROM "Categories" WHERE "id" = ?', args: [id] },
  ]);

  return results[1].rowsAffected > 0;
};
