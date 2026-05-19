import * as reservationModel from '../src/models/reservationModel.js';
import * as copyModel from '../src/models/copyModel.js';
import {
  listReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  ServiceError,
} from '../src/services/reservationService.js';

describe('reservationService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('relays the list of reservations', async () => {
    const reservations = [{ id: 1 }];
    jest.spyOn(reservationModel, 'listReservations').mockResolvedValue(reservations);

    await expect(listReservations()).resolves.toBe(reservations);
  });

  it('returns a reservation when found', async () => {
    const reservation = { id: 1, userId: 1, copyId: 1 };
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(reservation);

    await expect(getReservationById(1)).resolves.toBe(reservation);
  });

  it('throws when the reservation is missing', async () => {
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(undefined);

    await expect(getReservationById(1)).rejects.toThrow(ServiceError);
    await expect(getReservationById(1)).rejects.toThrow('Reserva não encontrada');
  });

  it('creates a reservation and sets copy to RESERVED', async () => {
    const copy = { id: 1, status: 'AVAILABLE' };
    const reservation = { id: 10, userId: 1, copyId: 1, status: 'PENDING' };
    jest.spyOn(copyModel, 'findCopy').mockResolvedValue(copy);
    jest.spyOn(copyModel, 'updateCopy').mockResolvedValue({ ...copy, status: 'RESERVED' });
    jest.spyOn(reservationModel, 'addReservation').mockResolvedValue(reservation);
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(reservation);

    const result = await createReservation({ copyId: 1 }, 1);

    expect(copyModel.updateCopy).toHaveBeenCalledWith(1, { status: 'RESERVED' });
    expect(result).toEqual(reservation);
  });

  it('throws when copy is not found on create', async () => {
    jest.spyOn(copyModel, 'findCopy').mockResolvedValue(undefined);

    await expect(createReservation({ copyId: 99 }, 1)).rejects.toThrow(ServiceError);
    await expect(createReservation({ copyId: 99 }, 1)).rejects.toThrow('Cópia não encontrada');
  });

  it('throws when copy is not available', async () => {
    jest.spyOn(copyModel, 'findCopy').mockResolvedValue({ id: 1, status: 'BORROWED' });

    await expect(createReservation({ copyId: 1 }, 1)).rejects.toThrow(ServiceError);
    await expect(createReservation({ copyId: 1 }, 1)).rejects.toThrow('Cópia não está disponível');
  });

  it('updates reservation to PICKED_UP and sets copy to BORROWED', async () => {
    const reservation = { id: 1, userId: 1, copyId: 1, status: 'PENDING' };
    const updated = { id: 1, userId: 1, copyId: 1, status: 'PICKED_UP', pickedUpAt: new Date() };
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(reservation);
    jest.spyOn(copyModel, 'updateCopy').mockResolvedValue({ id: 1, status: 'BORROWED' });
    jest.spyOn(reservationModel, 'updateReservation').mockResolvedValue(updated);

    const result = await updateReservation(1, { status: 'PICKED_UP' });

    expect(copyModel.updateCopy).toHaveBeenCalledWith(1, { status: 'BORROWED' });
    expect(result.status).toBe('PICKED_UP');
  });

  it('updates reservation to CANCELLED and sets copy to AVAILABLE', async () => {
    const reservation = { id: 1, userId: 1, copyId: 1, status: 'PENDING' };
    const updated = { id: 1, status: 'CANCELLED' };
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(reservation);
    jest.spyOn(copyModel, 'updateCopy').mockResolvedValue({ id: 1, status: 'AVAILABLE' });
    jest.spyOn(reservationModel, 'updateReservation').mockResolvedValue(updated);

    const result = await updateReservation(1, { status: 'CANCELLED' });

    expect(copyModel.updateCopy).toHaveBeenCalledWith(1, { status: 'AVAILABLE' });
    expect(result.status).toBe('CANCELLED');
  });

  it('updates reservation to EXPIRED and sets copy to AVAILABLE', async () => {
    const reservation = { id: 1, userId: 1, copyId: 1, status: 'PENDING' };
    const updated = { id: 1, status: 'EXPIRED' };
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(reservation);
    jest.spyOn(copyModel, 'updateCopy').mockResolvedValue({ id: 1, status: 'AVAILABLE' });
    jest.spyOn(reservationModel, 'updateReservation').mockResolvedValue(updated);

    const result = await updateReservation(1, { status: 'EXPIRED' });

    expect(copyModel.updateCopy).toHaveBeenCalledWith(1, { status: 'AVAILABLE' });
    expect(result.status).toBe('EXPIRED');
  });

  it('throws when updating a missing reservation', async () => {
    jest.spyOn(reservationModel, 'findReservation').mockResolvedValue(undefined);

    await expect(updateReservation(99, { status: 'CANCELLED' })).rejects.toThrow(ServiceError);
    await expect(updateReservation(99, { status: 'CANCELLED' })).rejects.toThrow('Reserva não encontrada');
  });

  it('removes a reservation when available', async () => {
    jest.spyOn(reservationModel, 'removeReservation').mockResolvedValue(true);

    await expect(deleteReservation(1)).resolves.toBeUndefined();
    expect(reservationModel.removeReservation).toHaveBeenCalledWith(1);
  });

  it('throws when deleting a missing reservation', async () => {
    jest.spyOn(reservationModel, 'removeReservation').mockResolvedValue(false);

    await expect(deleteReservation(99)).rejects.toThrow(ServiceError);
    await expect(deleteReservation(99)).rejects.toThrow('Reserva não encontrada');
  });
});
