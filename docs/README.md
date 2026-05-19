# Biblioteca API — Documentação

API REST para gerenciamento de biblioteca com CRUD de livros, autores, categorias, cópias físicas, reservas e usuários com autenticação JWT.

## Índice

- [Autenticação](auth.md)
- [Livros](books.md)
- [Autores](authors.md)
- [Categorias](categories.md)
- [Cópias](copies.md)
- [Reservas](reservations.md)
- [Usuários e Roles](users.md)

## Informações Gerais

| Item | Detalhe |
|------|---------|
| Base URL | `http://localhost:3333/api` |
| Swagger UI | `http://localhost:3333/api/docs` |
| Formato | JSON |
| Autenticação | JWT (Bearer token) |

### Paginação

Todas as listagens suportam paginação:

```
GET /api/books?page=1&limit=10
```

Resposta:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 41,
    "totalPages": 5
  }
}
```

### Códigos de Erro

| Status | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 204 | Removido (sem corpo) |
| 400 | Dados inválidos (validação Zod) |
| 401 | Token não fornecido ou inválido |
| 403 | Acesso negado (não é admin) |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicata, cópia indisponível) |
| 500 | Erro interno do servidor |
```
