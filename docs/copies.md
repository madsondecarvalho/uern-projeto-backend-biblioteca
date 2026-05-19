# Cópias

Cópias físicas de livros. Cada livro pode ter múltiplas cópias, cada uma com um código único (tombo/código de barras) e um status. Endpoints de escrita restritos a administradores.

## Status

| Status | Significado |
|--------|-------------|
| `AVAILABLE` | Disponível para reserva |
| `BORROWED` | Emprestada |
| `MAINTENANCE` | Em manutenção |
| `LOST` | Perdida |
| `RESERVED` | Reservada (aguardando retirada) |

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/copies` | — | Listar cópias |
| `GET` | `/api/copies/:id` | — | Buscar cópia por ID |
| `POST` | `/api/copies` | admin | Criar cópia |
| `PUT` | `/api/copies/:id` | admin | Atualizar cópia |
| `DELETE` | `/api/copies/:id` | admin | Remover cópia |

## Schema

```json
{
  "id": 1,
  "code": "BC-001",
  "status": "AVAILABLE",
  "bookId": 1,
  "Book": {
    "id": 1,
    "title": "O Primo Basílio",
    "year": 1878
  },
  "createdAt": "2026-05-19T00:00:00.000Z",
  "updatedAt": "2026-05-19T00:00:00.000Z"
}
```

## Exemplos

### Listar cópias por livro

```bash
curl "http://localhost:3333/api/copies?bookId=1"
```

### Listar cópias disponíveis

```bash
curl "http://localhost:3333/api/copies?status=AVAILABLE"
```

### Criar cópia (admin)

```bash
curl -X POST http://localhost:3333/api/copies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "code": "BC-100",
    "bookId": 1,
    "status": "AVAILABLE"
  }'
```

```json
{
  "id": 59,
  "code": "BC-100",
  "status": "AVAILABLE",
  "bookId": 1,
  "Book": { "id": 1, "title": "O Primo Basílio" }
}
```

### Atualizar status (admin)

```bash
curl -X PUT http://localhost:3333/api/copies/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "status": "MAINTENANCE" }'
```

### Erro — código duplicado (admin)

```bash
curl -X POST http://localhost:3333/api/copies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "code": "BC-001", "bookId": 1 }'
```

```json
{ "error": "Código já cadastrado" }
```
```
