import { Reservation, Copy, Book, User } from './index.js';

const baseInclude = () => [
  { model: Copy, include: [Book] },
  { model: User, attributes: ['id', 'name', 'email'] },
];

export const listReservations = async (filters = {}, pagination = {}) => {
  const where = {};

  if (filters.userId) where.userId = Number(filters.userId);
  if (filters.status) where.status = filters.status;
  if (filters.copyId) where.copyId = Number(filters.copyId);

  const page = Math.max(1, Number(pagination.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(pagination.limit) || 10));
  const offset = (page - 1) * limit;

  const { rows, count } = await Reservation.findAndCountAll({
    where,
    include: baseInclude(),
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
};

export const findReservation = async (id) =>
  Reservation.findByPk(id, { include: baseInclude() });

export const addReservation = async (payload) => Reservation.create(payload);

export const updateReservation = async (id, updates) => {
  const [affected] = await Reservation.update(updates, { where: { id } });
  if (affected === 0) return null;
  return Reservation.findByPk(id, { include: baseInclude() });
};

export const removeReservation = async (id) => {
  const deleted = await Reservation.destroy({ where: { id } });
  return deleted > 0;
};
