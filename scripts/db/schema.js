// Schema do banco libSQL/Turso (SQLite).
// Todos os comandos são idempotentes: podem rodar em todo deploy.
export const SCHEMA_STATEMENTS = [
  {
    sql: `CREATE TABLE IF NOT EXISTS "Authors" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL UNIQUE,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "Categories" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL UNIQUE,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "Users" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'user',
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "Books" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "title" TEXT NOT NULL,
      "year" INTEGER NOT NULL,
      "categoryId" INTEGER REFERENCES "Categories" ("id")
        ON UPDATE CASCADE ON DELETE SET NULL,
      "authorId" INTEGER NOT NULL REFERENCES "Authors" ("id")
        ON UPDATE CASCADE ON DELETE RESTRICT,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "Copies" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "code" TEXT NOT NULL UNIQUE,
      "status" TEXT NOT NULL DEFAULT 'AVAILABLE'
        CHECK ("status" IN ('AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST', 'RESERVED')),
      "bookId" INTEGER NOT NULL REFERENCES "Books" ("id")
        ON UPDATE CASCADE ON DELETE CASCADE,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
  },
  {
    sql: `CREATE TABLE IF NOT EXISTS "Reservations" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL REFERENCES "Users" ("id")
        ON UPDATE CASCADE ON DELETE CASCADE,
      "copyId" INTEGER NOT NULL REFERENCES "Copies" ("id")
        ON UPDATE CASCADE ON DELETE CASCADE,
      "status" TEXT NOT NULL DEFAULT 'PENDING'
        CHECK ("status" IN ('PENDING', 'PICKED_UP', 'CANCELLED', 'EXPIRED')),
      "reservedAt" TEXT NOT NULL,
      "expiresAt" TEXT NOT NULL,
      "pickedUpAt" TEXT,
      "returnedAt" TEXT,
      "createdAt" TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL
    )`,
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_books_category" ON "Books" ("categoryId")',
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_books_author" ON "Books" ("authorId")',
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_copies_book" ON "Copies" ("bookId")',
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_copies_status" ON "Copies" ("status")',
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_reservations_user" ON "Reservations" ("userId")',
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_reservations_copy" ON "Reservations" ("copyId")',
  },
  {
    sql: 'CREATE INDEX IF NOT EXISTS "idx_reservations_status" ON "Reservations" ("status")',
  },
];
