import { createBookSchema, replaceBookSchema } from '../src/schemas/bookSchema.js';

describe('createBookSchema', () => {
  it('accepts valid payload with default available', () => {
    const result = createBookSchema.safeParse({
      title: 'Book',
      author: 'Author',
      year: 2024,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: 'Book',
      author: 'Author',
      year: 2024,
      available: true,
    });
  });

  it('accepts valid payload with available=false', () => {
    const result = createBookSchema.safeParse({
      title: 'Book',
      author: 'Author',
      year: 2024,
      available: false,
    });

    expect(result.success).toBe(true);
    expect(result.data.available).toBe(false);
  });

  it('rejects missing title', () => {
    const result = createBookSchema.safeParse({ author: 'Author', year: 2024 });

    expect(result.success).toBe(false);
  });

  it('rejects missing author', () => {
    const result = createBookSchema.safeParse({ title: 'Book', year: 2024 });

    expect(result.success).toBe(false);
  });

  it('rejects missing year', () => {
    const result = createBookSchema.safeParse({ title: 'Book', author: 'Author' });

    expect(result.success).toBe(false);
  });

  it('rejects non-integer year', () => {
    const result = createBookSchema.safeParse({
      title: 'Book',
      author: 'Author',
      year: 2024.5,
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = createBookSchema.safeParse({
      title: '',
      author: 'Author',
      year: 2024,
    });

    expect(result.success).toBe(false);
  });
});

describe('replaceBookSchema', () => {
  it('accepts valid payload with available', () => {
    const result = replaceBookSchema.safeParse({
      title: 'Book',
      author: 'Author',
      year: 2024,
      available: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing available', () => {
    const result = replaceBookSchema.safeParse({
      title: 'Book',
      author: 'Author',
      year: 2024,
    });

    expect(result.success).toBe(false);
  });
});
