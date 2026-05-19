# Autores

CRUD de autores. Endpoints de escrita restritos a administradores.

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/authors` | — | Listar autores |
| `GET` | `/api/authors/:id` | — | Buscar autor por ID |
| `POST` | `/api/authors` | admin | Criar autor |
| `PUT` | `/api/authors/:id` | admin | Atualizar autor |
| `DELETE` | `/api/authors/:id` | admin | Remover autor |

## Schema

```json
{
  "id": 2,
  "name": "Machado de Assis"
}
```

## Exemplos

### Listar autores

```bash
curl "http://localhost:3333/api/authors?page=1&limit=10"
```

```json
{
  "data": [
    { "id": 1, "name": "José Maria de Eça de Queirós" },
    { "id": 2, "name": "Machado de Assis" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 15, "totalPages": 2 }
}
```

### Buscar por ID

```bash
curl http://localhost:3333/api/authors/2
```

```json
{ "id": 2, "name": "Machado de Assis" }
```

### Criar autor (admin)

```bash
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "name": "Clarice Lispector" }'
```

```json
{ "id": 16, "name": "Clarice Lispector" }
```

### Erro — autor já existe (admin)

```bash
curl -X POST http://localhost:3333/api/authors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "name": "Machado de Assis" }'
```

```json
{ "error": "Autor já existe" }
```
```
