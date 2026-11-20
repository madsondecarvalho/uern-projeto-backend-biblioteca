import { jest } from '@jest/globals';

let database;
let bookModel;
let authorModel;
let categoryModel;
let copyModel;
let reservationModel;
let userModel;
let dbHelpers;

const previousDatabaseUrl = process.env.TURSO_DATABASE_URL;

beforeAll(async () => {
  process.env.TURSO_DATABASE_URL = 'file::memory:';

  database = await import('../src/config/database.js');
  const { SCHEMA_STATEMENTS } = await import('../scripts/db/schema.js');

  await database.batch(SCHEMA_STATEMENTS);

  bookModel = await import('../src/models/bookModel.js');
  authorModel = await import('../src/models/authorModel.js');
  categoryModel = await import('../src/models/categoryModel.js');
  copyModel = await import('../src/models/copyModel.js');
  reservationModel = await import('../src/models/reservationModel.js');
  userModel = await import('../src/models/userModel.js');
  dbHelpers = await import('../src/models/dbHelpers.js');
});

beforeEach(async () => {
  await database.batch([
    { sql: 'DELETE FROM "Reservations"' },
    { sql: 'DELETE FROM "Copies"' },
    { sql: 'DELETE FROM "Books"' },
    { sql: 'DELETE FROM "Users"' },
    { sql: 'DELETE FROM "Categories"' },
    { sql: 'DELETE FROM "Authors"' },
  ]);
});

afterAll(async () => {
  database.closeDatabase();

  if (previousDatabaseUrl === undefined) {
    delete process.env.TURSO_DATABASE_URL;
  } else {
    process.env.TURSO_DATABASE_URL = previousDatabaseUrl;
  }
});

const createLibrary = async () => {
  const author = await authorModel.addAuthor({ name: 'Machado de Assis' });
  const category = await categoryModel.addCategory({ name: 'Clássico' });
  const book = await bookModel.addBook({
    title: 'Dom Casmurro',
    year: 1899,
    authorId: author.id,
    categoryId: category.id,
  });
  const user = await userModel.addUser({
    name: 'João Silva',
    email: 'joao@email.com',
    password: 'hash',
  });
  const copy = await copyModel.addCopy({ code: 'BC-001', bookId: book.id });

  return { author, category, book, user, copy };
};

describe('models com Turso/libSQL', () => {
  it('lista livros com autor, categoria e paginação', async () => {
    const { author, category, book } = await createLibrary();

    const result = await bookModel.listBooks({ categoryId: category.id }, { page: 1, limit: 10 });

    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: book.id,
      title: 'Dom Casmurro',
      year: 1899,
      categoryId: category.id,
      authorId: author.id,
      Author: { id: author.id, name: 'Machado de Assis' },
      Category: { id: category.id, name: 'Clássico' },
    });
  });

  it('atualiza livro e devolve os dados com includes', async () => {
    const { book } = await createLibrary();

    const updated = await bookModel.updateBook(book.id, { title: 'Dom Casmurro (ed. 1900)', year: 1900 });

    expect(updated).toMatchObject({
      id: book.id,
      title: 'Dom Casmurro (ed. 1900)',
      year: 1900,
    });
    expect(updated.Author.name).toBe('Machado de Assis');
  });

  it('detecta violação de unicidade', async () => {
    await authorModel.addAuthor({ name: 'Machado de Assis' });

    let error;
    try {
      await authorModel.addAuthor({ name: 'Machado de Assis' });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(dbHelpers.isUniqueConstraintError(error)).toBe(true);
  });

  it('rejeita referências inexistentes (autor/categoria)', async () => {
    await expect(
      bookModel.addBook({ title: 'Sem autor', year: 2000, authorId: 999, categoryId: null })
    ).rejects.toThrow('Autor não encontrado');

    const author = await authorModel.addAuthor({ name: 'Autora' });

    await expect(
      bookModel.addBook({ title: 'Sem categoria', year: 2000, authorId: author.id, categoryId: 999 })
    ).rejects.toThrow('Categoria não encontrada');
  });

  it('busca reserva com cópia, livro e usuário aninhados', async () => {
    const { book, user, copy } = await createLibrary();
    const now = new Date();
    const reservation = await reservationModel.addReservation({
      userId: user.id,
      copyId: copy.id,
      status: 'PENDING',
      reservedAt: now,
      expiresAt: new Date(now.getTime() + 86400000),
    });

    const found = await reservationModel.findReservation(reservation.id);

    expect(found).toMatchObject({
      id: reservation.id,
      userId: user.id,
      copyId: copy.id,
      status: 'PENDING',
      User: { id: user.id, name: 'João Silva', email: 'joao@email.com' },
      Copy: {
        id: copy.id,
        code: 'BC-001',
        bookId: book.id,
        Book: { id: book.id, title: 'Dom Casmurro' },
      },
    });
  });

  it('remove livro em cascata nas cópias e reservas', async () => {
    const { book, user, copy } = await createLibrary();
    const now = new Date();
    const reservation = await reservationModel.addReservation({
      userId: user.id,
      copyId: copy.id,
      status: 'PENDING',
      reservedAt: now,
      expiresAt: new Date(now.getTime() + 86400000),
    });

    await expect(bookModel.removeBook(book.id)).resolves.toBe(true);

    await expect(bookModel.findBook(book.id)).resolves.toBeNull();
    await expect(copyModel.findCopy(copy.id)).resolves.toBeNull();
    await expect(reservationModel.findReservation(reservation.id)).resolves.toBeNull();
  });

  it('ao remover categoria, desvincula os livros', async () => {
    const { category, book } = await createLibrary();

    await expect(categoryModel.removeCategory(category.id)).resolves.toBe(true);

    const found = await bookModel.findBook(book.id);
    expect(found.categoryId).toBeNull();
    expect(found.Category).toBeNull();
  });

  it('expõe a senha apenas na busca por email (login)', async () => {
    const { user } = await createLibrary();

    const publicUser = await userModel.findUserById(user.id);
    const loginUser = await userModel.findUserByEmail(user.email);

    expect(publicUser).not.toHaveProperty('password');
    expect(loginUser.password).toBe('hash');
  });
});
