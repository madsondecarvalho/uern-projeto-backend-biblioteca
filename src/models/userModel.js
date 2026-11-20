import { batch, query } from '../config/database.js';
import {
  insertRow,
  nowIso,
  paginated,
  parsePagination,
  toNumber,
  updateRow,
} from './dbHelpers.js';

const USER_FIELDS = ['name', 'email', 'password', 'role'];

const mapUser = (row, { includePassword = false } = {}) => {
  if (!row) return null;

  const user = {
    id: toNumber(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  if (includePassword) user.password = row.password;

  return user;
};

export const listUsers = async (pagination = {}) => {
  const paging = parsePagination(pagination);

  const countResult = await query('SELECT COUNT(*) AS total FROM "Users"');
  const total = Number(countResult.rows[0]?.total || 0);

  const result = await query(
    `SELECT "id", "name", "email", "role", "createdAt", "updatedAt"
     FROM "Users" ORDER BY "id" ASC LIMIT ? OFFSET ?`,
    [paging.limit, paging.offset]
  );

  return paginated(result.rows.map((row) => mapUser(row)), paging, total);
};

export const findUserById = async (id) => {
  const result = await query(
    `SELECT "id", "name", "email", "role", "createdAt", "updatedAt"
     FROM "Users" WHERE "id" = ?`,
    [id]
  );

  return mapUser(result.rows[0]);
};

export const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM "Users" WHERE "email" = ?', [email]);
  return mapUser(result.rows[0], { includePassword: true });
};

export const addUser = async (payload) => {
  const createdAt = nowIso();
  const user = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || 'user',
    createdAt,
    updatedAt: createdAt,
  };

  const id = await insertRow('Users', user);

  return {
    id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt,
    updatedAt: createdAt,
  };
};

export const updateUser = async (id, updates) => {
  const updated = await updateRow('Users', id, updates, USER_FIELDS);

  if (!updated) return null;

  return findUserById(id);
};

export const removeUser = async (id) => {
  const results = await batch([
    { sql: 'DELETE FROM "Reservations" WHERE "userId" = ?', args: [id] },
    { sql: 'DELETE FROM "Users" WHERE "id" = ?', args: [id] },
  ]);

  return results[1].rowsAffected > 0;
};
