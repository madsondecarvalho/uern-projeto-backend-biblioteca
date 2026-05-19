import { createBookSchema, replaceBookSchema } from '../src/schemas/bookSchema.js';

describe('createBookSchema', () => {
  it('accepts valid payload', () => {
    const result = createBookSchema.safeParse({
      title: 'Book',
      authorId: 1,
      year: 2024,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: 'Book',
      authorId: 1,
      year: 2024,
      categoryId: null,
    });
  });

  it('rejects missing title', () => {
    const result = createBookSchema.safeParse({ authorId: 1, year: 2024 });

    expect(result.success).toBe(false);
  });

  it('rejects missing authorId', () => {
    const result = createBookSchema.safeParse({ title: 'Book', year: 2024 });

    expect(result.success).toBe(false);
  });

  it('rejects missing year', () => {
    const result = createBookSchema.safeParse({ title: 'Book', authorId: 1 });

    expect(result.success).toBe(false);
  });

  it('rejects non-integer year', () => {
    const result = createBookSchema.safeParse({
      title: 'Book',
      authorId: 1,
      year: 2024.5,
    });

    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = createBookSchema.safeParse({
      title: '',
      authorId: 1,
      year: 2024,
    });

    expect(result.success).toBe(false);
  });
});

describe('replaceBookSchema', () => {
  it('accepts valid payload', () => {
    const result = replaceBookSchema.safeParse({
      title: 'Book',
      authorId: 1,
      year: 2024,
    });

    expect(result.success).toBe(true);
  });
});
