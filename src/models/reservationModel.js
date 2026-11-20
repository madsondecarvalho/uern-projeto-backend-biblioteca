import { query } from '../config/database.js';
import {
  insertRow,
  nowIso,
  paginated,
  parsePagination,
  toIso,
  toNumber,
  updateRow,
} from './dbHelpers.js';

const RESERVATION_FIELDS = ['status', 'pickedUpAt', 'returnedAt'];

const SELECT_RESERVATION = `
  SELECT r."id", r."userId", r."copyId", r."status",
         r."reservedAt", r."expiresAt", r."pickedUpAt", r."returnedAt",
         r."createdAt", r."updatedAt",
         cp."id" AS "copy_id", cp."code" AS "copy_code", cp."status" AS "copy_status",
         cp."bookId" AS "copy_bookId", cp."createdAt" AS "copy_createdAt",
         cp."updatedAt" AS "copy_updatedAt",
         b."id" AS "book_id", b."title" AS "book_title", b."year" AS "book_year",
         b."categoryId" AS "book_categoryId", b."authorId" AS "book_authorId",
         b."createdAt" AS "book_createdAt", b."updatedAt" AS "book_updatedAt",
         u."id" AS "user_id", u."name" AS "user_name", u."email" AS "user_email"
  FROM "Reservations" r
  LEFT JOIN "Copies" cp ON cp."id" = r."copyId"
  LEFT JOIN "Books" b ON b."id" = cp."bookId"
  LEFT JOIN "Users" u ON u."id" = r."userId"
`;

const mapReservation = (row) => {
  if (!row) return null;

  return {
    id: toNumber(row.id),
    userId: toNumber(row.userId),
    copyId: toNumber(row.copyId),
    status: row.status,
    reservedAt: row.reservedAt,
    expiresAt: row.expiresAt,
    pickedUpAt: row.pickedUpAt,
    returnedAt: row.returnedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    Copy: row.copy_id == null
      ? null
      : {
        id: toNumber(row.copy_id),
        code: row.copy_code,
        status: row.copy_status,
        bookId: toNumber(row.copy_bookId),
        createdAt: row.copy_createdAt,
        updatedAt: row.copy_updatedAt,
        Book: row.book_id == null
          ? null
          : {
            id: toNumber(row.book_id),
            title: row.book_title,
            year: toNumber(row.book_year),
            categoryId: toNumber(row.book_categoryId),
            authorId: toNumber(row.book_authorId),
            createdAt: row.book_createdAt,
            updatedAt: row.book_updatedAt,
          },
      },
    User: row.user_id == null
      ? null
      : {
        id: toNumber(row.user_id),
        name: row.user_name,
        email: row.user_email,
      },
  };
};

export const listReservations = async (filters = {}, pagination = {}) => {
  const conditions = [];
  const args = [];

  if (filters.userId) {
    conditions.push('r."userId" = ?');
    args.push(Number(filters.userId));
  }

  if (filters.status) {
    conditions.push('r."status" = ?');
    args.push(filters.status);
  }

  if (filters.copyId) {
    conditions.push('r."copyId" = ?');
    args.push(Number(filters.copyId));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const paging = parsePagination(pagination);

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM "Reservations" r ${where}`,
    args
  );
  const total = Number(countResult.rows[0]?.total || 0);

  const result = await query(
    `${SELECT_RESERVATION} ${where} ORDER BY r."createdAt" DESC, r."id" DESC
     LIMIT ? OFFSET ?`,
    [...args, paging.limit, paging.offset]
  );

  return paginated(result.rows.map(mapReservation), paging, total);
};

export const findReservation = async (id) => {
  const result = await query(
    `${SELECT_RESERVATION} WHERE r."id" = ?`,
    [id]
  );

  return mapReservation(result.rows[0]);
};

export const addReservation = async (payload) => {
  const createdAt = nowIso();
  const reservation = {
    userId: payload.userId,
    copyId: payload.copyId,
    status: payload.status || 'PENDING',
    reservedAt: toIso(payload.reservedAt),
    expiresAt: toIso(payload.expiresAt),
    pickedUpAt: toIso(payload.pickedUpAt),
    returnedAt: toIso(payload.returnedAt),
    createdAt,
    updatedAt: createdAt,
  };

  const id = await insertRow('Reservations', reservation);

  return {
    id,
    userId: toNumber(reservation.userId),
    copyId: toNumber(reservation.copyId),
    status: reservation.status,
    reservedAt: reservation.reservedAt,
    expiresAt: reservation.expiresAt,
    pickedUpAt: reservation.pickedUpAt,
    returnedAt: reservation.returnedAt,
    createdAt,
    updatedAt: createdAt,
  };
};

export const updateReservation = async (id, updates) => {
  const updated = await updateRow(
    'Reservations',
    id,
    updates,
    RESERVATION_FIELDS
  );

  if (!updated) return null;

  return findReservation(id);
};

export const removeReservation = async (id) => {
  const result = await query('DELETE FROM "Reservations" WHERE "id" = ?', [id]);
  return result.rowsAffected > 0;
};
