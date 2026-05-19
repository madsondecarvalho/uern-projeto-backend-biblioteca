# Diagrama de Classes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BIBLIOTECA API                                    │
│                     Diagrama de Classes (Sequelize)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐       ┌──────────────────────────────┐
│           Author             │       │          Category           │
│──────────────────────────────│       │──────────────────────────────│
│  id: INTEGER (PK)           │       │  id: INTEGER (PK)           │
│  name: STRING(255) (UNIQUE) │       │  name: STRING(100) (UNIQUE) │
│  createdAt: DATE            │       │  createdAt: DATE            │
│  updatedAt: DATE            │       │  updatedAt: DATE            │
├──────────────────────────────┤       ├──────────────────────────────┤
│  + hasMany: Book            │       │  + hasMany: Book            │
└──────────┬───────────────────┘       └──────────┬───────────────────┘
           │ 1                                    │ 1
           │                                      │
           │                      ┌───────────────┘
           │                      │
           ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                                  Book                                      │
│────────────────────────────────────────────────────────────────────────────│
│  id: INTEGER (PK)                                                         │
│  title: STRING(255) (NOT NULL)                                            │
│  year: INTEGER (NOT NULL)                                                 │
│  available: BOOLEAN (default: true)                                       │
│  authorId: INTEGER (FK → Author) (NOT NULL)                               │
│  categoryId: INTEGER (FK → Category) (NULLABLE)                           │
│  createdAt: DATE                                                          │
│  updatedAt: DATE                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│  + belongsTo: Author                                                      │
│  + belongsTo: Category                                                    │
│  + hasMany: Copy                                                          │
└─────────────────────────────────────────────────────┬──────────────────────┘
                                                      │ 1
                                                      │
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                                  Copy                                      │
│────────────────────────────────────────────────────────────────────────────│
│  id: INTEGER (PK)                                                         │
│  code: STRING(50) (UNIQUE, NOT NULL)   ← Código de barras / tombo        │
│  status: ENUM (AVAILABLE | BORROWED | MAINTENANCE | LOST | RESERVED)     │
│  bookId: INTEGER (FK → Book) (NOT NULL)                                   │
│  createdAt: DATE                                                          │
│  updatedAt: DATE                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│  + belongsTo: Book                                                        │
│  + hasMany: Reservation                                                   │
└─────────────────────────────────────────────────────┬──────────────────────┘
                                                      │ 1
                                                      │
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              Reservation                                   │
│────────────────────────────────────────────────────────────────────────────│
│  id: INTEGER (PK)                                                         │
│  userId: INTEGER (FK → User) (NOT NULL)                                   │
│  copyId: INTEGER (FK → Copy) (NOT NULL)                                   │
│  status: ENUM (PENDING | PICKED_UP | CANCELLED | EXPIRED)                 │
│  reservedAt: DATE (NOT NULL)                                              │
│  expiresAt: DATE (NOT NULL)       ← Expira em 24h após a reserva         │
│  pickedUpAt: DATE (NULLABLE)      ← Preenchido no PICKED_UP              │
│  returnedAt: DATE (NULLABLE)      ← Preenchido na devolução              │
│  createdAt: DATE                                                          │
│  updatedAt: DATE                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│  + belongsTo: Copy                                                        │
│  + belongsTo: User                                                        │
└───────────────────────────┬────────────────────────────────────────────────┘
                            │ N
                            │
                            │ N
┌───────────────────────────▼────────────────────────────────────────────────┐
│                                  User                                      │
│────────────────────────────────────────────────────────────────────────────│
│  id: INTEGER (PK)                                                         │
│  name: STRING(255) (NOT NULL)                                             │
│  email: STRING(255) (UNIQUE, NOT NULL)                                    │
│  password: STRING(255) (NOT NULL)   ← Excluída do defaultScope           │
│  role: ENUM (user | admin) (default: user)                                │
│  createdAt: DATE                                                          │
│  updatedAt: DATE                                                          │
├────────────────────────────────────────────────────────────────────────────┤
│  + hasMany: Reservation                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

## Legend

| Símbolo | Significado |
|---------|-------------|
| `(PK)` | Primary Key |
| `(FK)` | Foreign Key |
| `(UNIQUE)` | Unique constraint |
| `(NOT NULL)` | Campo obrigatório |
| `(NULLABLE)` | Campo opcional |
| `─ 1` | Um |
| `─ N` | Muitos |
| `belongsTo` | Relação N:1 (a tabela tem a FK) |
| `hasMany` | Relação 1:N |

## Resumo das Relações

```
Author   1 ──── N Book
Category 1 ──── N Book
Book     1 ──── N Copy
Copy     1 ──── N Reservation
User     1 ──── N Reservation
```

## Fluxo de Dados

```
Usuário → POST /api/reservations { copyId }
            │
            ▼
         Copy.status = "RESERVED"
         Reservation.status = "PENDING"
         Reservation.expiresAt = now + 24h
            │
            ├── Admin → PUT status:"PICKED_UP"  → Copy.status = "BORROWED"
            ├── Admin → PUT status:"CANCELLED"  → Copy.status = "AVAILABLE"
            └── Admin → PUT status:"EXPIRED"    → Copy.status = "AVAILABLE"
```
