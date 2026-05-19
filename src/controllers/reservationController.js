import * as reservationService from '../services/reservationService.js';

export const getAllReservations = async (req, res) => {
  const { page, limit, ...filters } = req.query;

  if (req.user.role !== 'admin') {
    filters.userId = req.user.id;
  }

  res.json(await reservationService.listReservations(filters, { page, limit }));
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(Number(req.params.id));

    if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json(reservation);
  } catch (err) {
    if (err instanceof reservationService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const createReservation = async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body, req.user.id);
    res.status(201).json(reservation);
  } catch (err) {
    if (err instanceof reservationService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const updateReservation = async (req, res) => {
  try {
    const updated = await reservationService.updateReservation(Number(req.params.id), req.body);
    res.json(updated);
  } catch (err) {
    if (err instanceof reservationService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};

export const deleteReservation = async (req, res) => {
  try {
    await reservationService.deleteReservation(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    if (err instanceof reservationService.ServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
};
