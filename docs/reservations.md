# Reservas

Sistema de reserva de cópias físicas para retirada pessoal na biblioteca.

## Fluxo

```
1. Usuário → POST /api/reservations { copyId }
   → Cópia muda para RESERVED
   → Reserva criada com status PENDING (expira em 24h)

2. Admin → PUT /api/reservations/:id { status: "PICKED_UP" }
   → Reserva muda para PICKED_UP
   → Cópia muda para BORROWED

3. Admin → PUT /api/reservations/:id { status: "CANCELLED" }
   → Reserva muda para CANCELLED
   → Cópia volta para AVAILABLE

4. Admin → PUT /api/reservations/:id { status: "EXPIRED" }
   → Reserva muda para EXPIRED
   → Cópia volta para AVAILABLE
```

## Status da Reserva

| Status | Significado |
|--------|-------------|
| `PENDING` | Aguardando retirada |
| `PICKED_UP` | Retirada confirmada |
| `CANCELLED` | Cancelada |
| `EXPIRED` | Expirada (não retirada em 24h) |

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/reservations` | auth | Listar reservas |
| `GET` | `/api/reservations/:id` | auth | Buscar reserva |
| `POST` | `/api/reservations` | auth | Reservar cópia |
| `PUT` | `/api/reservations/:id` | admin | Alterar status |
| `DELETE` | `/api/reservations/:id` | admin | Remover reserva |

> **Regras de visibilidade:** Usuários comuns veem apenas suas próprias reservas. Administradores veem todas.

## Schema

```json
{
  "id": 1,
  "userId": 2,
  "User": { "id": 2, "name": "João Silva", "email": "joao@email.com" },
  "copyId": 5,
  "Copy": {
    "id": 5,
    "code": "BC-005",
    "status": "RESERVED",
    "bookId": 5,
    "Book": { "id": 5, "title": "Capitães da Areia" }
  },
  "status": "PENDING",
  "reservedAt": "2026-05-19T12:00:00.000Z",
  "expiresAt": "2026-05-20T12:00:00.000Z",
  "pickedUpAt": null,
  "returnedAt": null,
  "createdAt": "2026-05-19T12:00:00.000Z",
  "updatedAt": "2026-05-19T12:00:00.000Z"
}
```

## Exemplos

### 1. Usuário faz login

```bash
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "joao@email.com", "password": "senha123" }'
```

Salve o token retornado para usar nos próximos passos.

### 2. Listar cópias disponíveis

```bash
curl "http://localhost:3333/api/copies?status=AVAILABLE&page=1&limit=5"
```

### 3. Reservar uma cópia

```bash
curl -X POST http://localhost:3333/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_JOÃO" \
  -d '{ "copyId": 5 }'
```

Resposta `201`:

```json
{
  "id": 1,
  "userId": 2,
  "copyId": 5,
  "status": "PENDING",
  "reservedAt": "2026-05-19T12:00:00.000Z",
  "expiresAt": "2026-05-20T12:00:00.000Z",
  "pickedUpAt": null,
  "returnedAt": null
}
```

### 4. Ver reservas do usuário

```bash
curl http://localhost:3333/api/reservations \
  -H "Authorization: Bearer TOKEN_DO_JOÃO"
```

Retorna apenas as reservas do próprio usuário.

### 5. Admin confirma retirada

```bash
curl -X PUT http://localhost:3333/api/reservations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "status": "PICKED_UP" }'
```

A cópia vai para `BORROWED`.

### 6. Admin cancela reserva

```bash
curl -X PUT http://localhost:3333/api/reservations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "status": "CANCELLED" }'
```

A cópia volta para `AVAILABLE`.

### Erro — cópia não disponível

```bash
curl -X POST http://localhost:3333/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_JOÃO" \
  -d '{ "copyId": 5 }'
```

```json
{ "error": "Cópia não está disponível" }
```

### Erro — acesso negado (usuário vê reserva de outro)

```bash
curl http://localhost:3333/api/reservations/1 \
  -H "Authorization: Bearer TOKEN_DA_MARIA"
```

```json
{ "error": "Acesso negado" }
```
```
