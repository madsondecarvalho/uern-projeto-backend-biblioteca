import { createUserSchema, updateUserSchema, loginSchema } from '../src/schemas/userSchema.js';

describe('createUserSchema', () => {
  it('accepts valid payload with default role', () => {
    const result = createUserSchema.safeParse({
      name: 'Teste',
      email: 'teste@email.com',
      password: '123456',
    });

    expect(result.success).toBe(true);
    expect(result.data.role).toBe('user');
  });

  it('accepts valid payload with admin role', () => {
    const result = createUserSchema.safeParse({
      name: 'Admin',
      email: 'admin@email.com',
      password: '123456',
      role: 'admin',
    });

    expect(result.success).toBe(true);
    expect(result.data.role).toBe('admin');
  });

  it('rejects missing name', () => {
    const result = createUserSchema.safeParse({
      email: 'teste@email.com',
      password: '123456',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      name: 'Teste',
      email: 'invalid',
      password: '123456',
    });

    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = createUserSchema.safeParse({
      name: 'Teste',
      email: 'teste@email.com',
      password: '123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = createUserSchema.safeParse({
      name: 'Teste',
      email: 'teste@email.com',
      password: '123456',
      role: 'moderator',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('accepts partial update', () => {
    const result = updateUserSchema.safeParse({ name: 'Novo Nome' });

    expect(result.success).toBe(true);
  });

  it('accepts full update', () => {
    const result = updateUserSchema.safeParse({
      name: 'Novo',
      email: 'novo@email.com',
      password: '123456',
      role: 'admin',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email in partial update', () => {
    const result = updateUserSchema.safeParse({ email: 'bademail' });

    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'teste@email.com',
      password: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: '123456' });

    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'teste@email.com' });

    expect(result.success).toBe(false);
  });
});
