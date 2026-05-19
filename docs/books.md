# Livros

CRUD de livros. A listagem aceita filtros e paginação.

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/books` | — | Listar livros |
| `GET` | `/api/books/:id` | — | Buscar livro por ID |
| `POST` | `/api/books` | — | Criar livro |
| `PUT` | `/api/books/:id` | — | Substituir livro |
| `DELETE` | `/api/books/:id` | — | Remover livro |

## Schema

```json
{
  "id": 1,
  "title": "Dom Casmurro",
  "year": 1899,
  "available": false,
  "authorId": 2,
  "Author": { "id": 2, "name": "Machado de Assis" },
  "categoryId": 2,
  "Category": { "id": 2, "name": "Clássico" },
  "createdAt": "2026-05-19T00:00:00.000Z",
  "updatedAt": "2026-05-19T00:00:00.000Z"
}
```

## Exemplos

### Listar livros (paginado)

```bash
curl "http://localhost:3333/api/books?page=1&limit=5"
```

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 5, "total": 41, "totalPages": 9 }
}
```

### Listar livros por categoria

```bash
curl "http://localhost:3333/api/books?categoryId=2"
```

### Listar livros por autor

```bash
curl "http://localhost:3333/api/books?authorId=2"
```

### Combinar filtros

```bash
curl "http://localhost:3333/api/books?categoryId=2&authorId=2&page=1&limit=10"
```

### Buscar por ID

```bash
curl http://localhost:3333/api/books/1
```

```json
{
  "id": 1,
  "title": "O Primo Basílio",
  "year": 1878,
  "available": true,
  "authorId": 1,
  "Author": { "id": 1, "name": "José Maria de Eça de Queirós" },
  "categoryId": 1,
  "Category": { "id": 1, "name": "Romance" }
}
```

### Criar livro

```bash
curl -X POST http://localhost:3333/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Novo Livro",
    "authorId": 2,
    "year": 2024,
    "available": true,
    "categoryId": 1
  }'
```

### Atualizar livro

```bash
curl -X PUT http://localhost:3333/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título Alterado",
    "authorId": 2,
    "year": 2000,
    "available": false,
    "categoryId": 2
  }'
```

### Remover livro

```bash
curl -X DELETE http://localhost:3333/api/books/1
```

Resposta: `204 No Content`

### Erro de validação (400)

```bash
curl -X POST http://localhost:3333/api/books \
  -H "Content-Type: application/json" \
  -d '{ "title": "" }'
```

```json
{
  "error": "Dados inválidos",
  "issues": [
    { "field": "title", "message": "Título é obrigatório" },
    { "field": "authorId", "message": "Autor é obrigatório" },
    { "field": "year", "message": "Ano é obrigatório" }
  ]
}
```
```
