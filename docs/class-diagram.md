# Diagrama de Classes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BIBLIOTECA API                                    │
│                     Diagrama de Classes (Turso/libSQL)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐       ┌──────────────────────────────┐
│           Author             │       │          Category           │
│──────────────────────────────│       │──────────────────────────────│
│  id: INTEGER (PK)           │       │  id: INTEGER (PK)           │
│  name: TEXT (UNIQUE)        │       │  name: TEXT (UNIQUE)        │
│  createdAt: TEXT            │       │  createdAt: TEXT            │
│  updatedAt: TEXT            │       │  updatedAt: TEXT            │
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
│  title: TEXT (NOT NULL)                                                   │
│  year: INTEGER (NOT NULL)                                                 │
│  authorId: INTEGER (FK → Author) (NOT NULL)                               │
│  categoryId: INTEGER (FK → Category) (NULLABLE)                           │
│  createdAt: TEXT                                                          │
│  updatedAt: TEXT                                                          │
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
│  code: TEXT (UNIQUE, NOT NULL)         ← Código de barras / tombo        │
│  status: TEXT CHECK (AVAILABLE | BORROWED | MAINTENANCE | LOST | RESERVED)│
│  bookId: INTEGER (FK → Book) (NOT NULL)                                   │
│  createdAt: TEXT                                                          │
│  updatedAt: TEXT                                                          │
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
│  status: TEXT CHECK (PENDING | PICKED_UP | CANCELLED | EXPIRED)           │
│  reservedAt: TEXT (NOT NULL)                                              │
│  expiresAt: TEXT (NOT NULL)       ← Expira em 24h após a reserva         │
│  pickedUpAt: TEXT (NULLABLE)      ← Preenchido no PICKED_UP              │
│  returnedAt: TEXT (NULLABLE)      ← Preenchido na devolução              │
│  createdAt: TEXT                                                          │
│  updatedAt: TEXT                                                          │
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
│  name: TEXT (NOT NULL)                                                    │
│  email: TEXT (UNIQUE, NOT NULL)                                           │
│  password: TEXT (NOT NULL)   ← Omitida nas consultas públicas             │
│  role: TEXT (user | admin) (default: user)                                │
│  createdAt: TEXT                                                          │
│  updatedAt: TEXT                                                          │
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
