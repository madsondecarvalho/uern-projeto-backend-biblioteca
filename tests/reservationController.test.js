import { jest } from '@jest/globals';
import * as reservationController from '../src/controllers/reservationController.js';
import * as reservationService from '../src/services/reservationService.js';

const { getAllReservations, getReservationById, createReservation, updateReservation, deleteReservation } = reservationController;
const { ServiceError } = reservationService;

const response = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
};

describe('reservationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all reservations for admin', async () => {
    const req = { query: {}, user: { id: 1, role: 'admin' } };
    const res = response();
    const reservations = [{ id: 1 }];
    jest.spyOn(reservationService, 'listReservations').mockResolvedValue(reservations);

    await getAllReservations(req, res);

    expect(res.json).toHaveBeenCalledWith(reservations);
  });

  it('filters by own userId for non-admin', async () => {
    const req = { query: {}, user: { id: 5, role: 'user' } };
    const res = response();
    jest.spyOn(reservationService, 'listReservations').mockResolvedValue([]);

    await getAllReservations(req, res);

    expect(reservationService.listReservations).toHaveBeenCalledWith(
      { userId: 5 },
      { page: undefined, limit: undefined },
    );
  });

  it('returns a reservation when service resolves and user is owner', async () => {
    const res = response();
    const req = { params: { id: '1' }, user: { id: 1, role: 'user' } };
    const reservation = { id: 1, userId: 1 };
    jest.spyOn(reservationService, 'getReservationById').mockResolvedValue(reservation);

    await getReservationById(req, res);

    expect(res.json).toHaveBeenCalledWith(reservation);
  });

  it('denies access when non-admin tries to see another users reservation', async () => {
    const res = response();
    const req = { params: { id: '1' }, user: { id: 2, role: 'user' } };
    const reservation = { id: 1, userId: 1 };
    jest.spyOn(reservationService, 'getReservationById').mockResolvedValue(reservation);

    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
  });

  it('allows admin to see any reservation', async () => {
    const res = response();
    const req = { params: { id: '1' }, user: { id: 2, role: 'admin' } };
    const reservation = { id: 1, userId: 1 };
    jest.spyOn(reservationService, 'getReservationById').mockResolvedValue(reservation);

    await getReservationById(req, res);

    expect(res.json).toHaveBeenCalledWith(reservation);
  });

  it('handles service errors on get', async () => {
    const res = response();
    const req = { params: { id: '1' }, user: { id: 1, role: 'user' } };
    const error = new ServiceError('Reserva não encontrada', 404);
    jest.spyOn(reservationService, 'getReservationById').mockRejectedValue(error);

    await getReservationById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Reserva não encontrada' });
  });

  it('creates a reservation and returns 201', async () => {
    const body = { copyId: 1 };
    const req = { body, user: { id: 1 } };
    const res = response();
    jest.spyOn(reservationService, 'createReservation').mockResolvedValue({ id: 10, ...body, userId: 1 });

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 10, ...body, userId: 1 });
  });

  it('handles create errors gracefully', async () => {
    const req = { body: { copyId: 1 }, user: { id: 1 } };
    const res = response();
    const error = new ServiceError('Cópia não está disponível', 409);
    jest.spyOn(reservationService, 'createReservation').mockRejectedValue(error);

    await createReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cópia não está disponível' });
  });

  it('updates a reservation', async () => {
    const req = { params: { id: '1' }, body: { status: 'PICKED_UP' } };
    const res = response();
    const updated = { id: 1, status: 'PICKED_UP' };
    jest.spyOn(reservationService, 'updateReservation').mockResolvedValue(updated);

    await updateReservation(req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('handles update errors gracefully', async () => {
    const req = { params: { id: '99' }, body: { status: 'CANCELLED' } };
    const res = response();
    const error = new ServiceError('Reserva não encontrada', 404);
    jest.spyOn(reservationService, 'updateReservation').mockRejectedValue(error);

    await updateReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes a reservation and sends 204', async () => {
    const req = { params: { id: '1' } };
    const res = response();
    jest.spyOn(reservationService, 'deleteReservation').mockResolvedValue(undefined);

    await deleteReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('handles delete errors gracefully', async () => {
    const req = { params: { id: '99' } };
    const res = response();
    const error = new ServiceError('Reserva não encontrada', 404);
    jest.spyOn(reservationService, 'deleteReservation').mockRejectedValue(error);

    await deleteReservation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Reserva não encontrada' });
  });
});
