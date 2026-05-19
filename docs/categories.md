# Categorias

CRUD de categorias de livros. Endpoints de escrita restritos a administradores.

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/categories` | — | Listar categorias |
| `GET` | `/api/categories/:id` | — | Buscar categoria por ID |
| `POST` | `/api/categories` | admin | Criar categoria |
| `PUT` | `/api/categories/:id` | admin | Atualizar categoria |
| `DELETE` | `/api/categories/:id` | admin | Remover categoria |

## Schema

```json
{
  "id": 1,
  "name": "Romance"
}
```

## Exemplos

### Listar categorias

```bash
curl "http://localhost:3333/api/categories"
```

```json
{
  "data": [
    { "id": 1, "name": "Romance" },
    { "id": 2, "name": "Clássico" },
    { "id": 3, "name": "Drama" },
    { "id": 4, "name": "Ficção Científica" },
    { "id": 5, "name": "Fantasia" },
    { "id": 6, "name": "Terror" },
    { "id": 7, "name": "Aventura" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 7, "totalPages": 1 }
}
```

### Criar categoria (admin)

```bash
curl -X POST http://localhost:3333/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "name": "Suspense" }'
```

```json
{ "id": 8, "name": "Suspense" }
```
```
