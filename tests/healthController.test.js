import { jest } from '@jest/globals';

jest.mock('../src/config/database.js', () => ({
  __esModule: true,
  default: { authenticate: jest.fn() },
}));

import sequelize from '../src/config/database.js';
import { healthCheck } from '../src/controllers/healthController.js';

const response = () => {
  const res = {};
  res.set = jest.fn(() => res);
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const responseBody = (res) => res.json.mock.calls[0][0];

describe('healthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 200 and database up when the connection succeeds', async () => {
    const res = response();
    sequelize.authenticate.mockResolvedValue(undefined);

    await healthCheck({}, res);

    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(res.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ok', database: 'up' })
    );
  });

  it('includes a valid uptime and ISO timestamp in the response', async () => {
    const res = response();
    sequelize.authenticate.mockResolvedValue(undefined);

    await healthCheck({}, res);

    const body = responseBody(res);
    expect(Number.isInteger(body.uptime)).toBe(true);
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('returns 503 and database down when the connection fails', async () => {
    const res = response();
    sequelize.authenticate.mockRejectedValue(new Error('connection refused'));

    await healthCheck({}, res);

    expect(res.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'degraded', database: 'down' })
    );
  });

  it('does not expose internal error details in the response', async () => {
    const res = response();
    sequelize.authenticate.mockRejectedValue(
      new Error('password authentication failed for user "postgres"')
    );

    await healthCheck({}, res);

    expect(JSON.stringify(responseBody(res))).not.toContain('password');
    expect(JSON.stringify(responseBody(res))).not.toContain('postgres');
  });

  it('logs the database failure reason', async () => {
    const res = response();
    const error = new Error('connection refused');
    sequelize.authenticate.mockRejectedValue(error);

    await healthCheck({}, res);

    expect(console.error).toHaveBeenCalledWith('[health] banco indisponível:', 'connection refused');
  });

  it('checks the database on every request', async () => {
    sequelize.authenticate.mockResolvedValue(undefined);

    await healthCheck({}, response());
    await healthCheck({}, response());

    expect(sequelize.authenticate).toHaveBeenCalledTimes(2);
  });

  it('resolves without throwing when the database is unavailable', async () => {
    const res = response();
    sequelize.authenticate.mockRejectedValue(new Error('timeout'));

    await expect(healthCheck({}, res)).resolves.toBe(res);
  });
});
