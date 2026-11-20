import { query } from '../config/database.js';

export const nowIso = () => new Date().toISOString();

export const toIso = (value) => {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : value;
};

export const toNumber = (value) => (value == null ? null : Number(value));

export const parsePagination = (pagination = {}) => {
  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));

  return { page, limit, offset: (page - 1) * limit };
};

export const paginated = (data, { page, limit }, total) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});

// Valida referências antes de inserir/atualizar. Como o libSQL pode rodar
// com foreign_keys desabilitado, a checagem é feita na aplicação.
export const assertRowExists = async (table, id, message) => {
  const result = await query(
    `SELECT 1 AS ok FROM "${table}" WHERE "id" = ? LIMIT 1`,
    [id]
  );

  if (!result.rows[0]) {
    const err = new Error(message);
    err.name = 'ForeignKeyConstraintError';
    throw err;
  }
};

// Insere e devolve o id gerado. Nomes de tabela/coluna vêm de constantes
// internas dos models, nunca da requisição.
export const insertRow = async (table, data) => {
  const fields = Object.keys(data);
  const placeholders = fields.map(() => '?').join(', ');
  const columns = fields.map((field) => `"${field}"`).join(', ');
  const values = fields.map((field) => toIso(data[field]));

  const { lastInsertRowid } = await query(
    `INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`,
    values
  );

  return Number(lastInsertRowid);
};

export const updateRow = async (table, id, updates, allowedFields) => {
  const fields = allowedFields.filter(
    (field) => updates[field] !== undefined
  );

  const assignments = fields.map((field) => `"${field}" = ?`);
  const values = fields.map((field) => toIso(updates[field]));

  assignments.push('"updatedAt" = ?');
  values.push(nowIso(), id);

  const { rowsAffected } = await query(
    `UPDATE "${table}" SET ${assignments.join(', ')} WHERE "id" = ?`,
    values
  );

  return rowsAffected > 0;
};

export const isUniqueConstraintError = (err) => {
  if (!err) return false;

  const code = err.code || err.cause?.code;

  return (
    err.name === 'SequelizeUniqueConstraintError' ||
    err.name === 'UniqueConstraintError' ||
    code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    /UNIQUE constraint failed/i.test(err.message || '')
  );
};
