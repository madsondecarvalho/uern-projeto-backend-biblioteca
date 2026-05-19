import * as reservationModel from '../models/reservationModel.js';
import * as copyModel from '../models/copyModel.js';

export class ServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export const listReservations = async (filters = {}, pagination = {}) =>
  reservationModel.listReservations(filters, pagination);

export const getReservationById = async (id) => {
  const reservation = await reservationModel.findReservation(id);
  if (!reservation) throw new ServiceError('Reserva não encontrada', 404);
  return reservation;
};

export const createReservation = async (payload, userId) => {
  const copy = await copyModel.findCopy(payload.copyId);
  if (!copy) throw new ServiceError('Cópia não encontrada', 404);
  if (copy.status !== 'AVAILABLE') throw new ServiceError('Cópia não está disponível', 409);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const reservation = await reservationModel.addReservation({
    userId,
    copyId: payload.copyId,
    status: 'PENDING',
    reservedAt: now,
    expiresAt,
  });

  await copyModel.updateCopy(payload.copyId, { status: 'RESERVED' });

  return reservationModel.findReservation(reservation.id);
};

export const updateReservation = async (id, payload) => {
  const reservation = await reservationModel.findReservation(id);
  if (!reservation) throw new ServiceError('Reserva não encontrada', 404);

  const updates = { ...payload };
  const newStatus = payload.status;

  if (newStatus === 'PICKED_UP') {
    updates.pickedUpAt = new Date();
    await copyModel.updateCopy(reservation.copyId, { status: 'BORROWED' });
  } else if (newStatus === 'CANCELLED') {
    await copyModel.updateCopy(reservation.copyId, { status: 'AVAILABLE' });
  } else if (newStatus === 'EXPIRED') {
    await copyModel.updateCopy(reservation.copyId, { status: 'AVAILABLE' });
  }

  const updated = await reservationModel.updateReservation(id, updates);
  if (!updated) throw new ServiceError('Reserva não encontrada', 404);
  return updated;
};

export const deleteReservation = async (id) => {
  const removed = await reservationModel.removeReservation(id);
  if (!removed) throw new ServiceError('Reserva não encontrada', 404);
};
