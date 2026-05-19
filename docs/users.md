# Usuários e Roles

CRUD de usuários do sistema. Endpoints de escrita restritos a administradores.

## Roles

| Role | Permissões |
|------|------------|
| `admin` | CRUD de livros, autores, categorias, cópias, usuários; gerenciar reservas (retirada, cancelamento) |
| `user` | Visualizar livros, autores, categorias, cópias; criar e ver próprias reservas |

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/users` | auth | Listar usuários |
| `GET` | `/api/users/:id` | auth | Buscar usuário por ID |
| `POST` | `/api/users` | admin | Criar usuário |
| `PUT` | `/api/users/:id` | admin | Atualizar usuário |
| `DELETE` | `/api/users/:id` | admin | Remover usuário |

> A senha nunca é retornada nas respostas (omitida por padrão pelo model).

## Schema (resposta)

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@biblioteca.com",
  "role": "admin",
  "createdAt": "2026-05-19T00:00:00.000Z",
  "updatedAt": "2026-05-19T00:00:00.000Z"
}
```

## Exemplos

### Listar usuários (autenticado)

```bash
curl http://localhost:3333/api/users \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

```json
{
  "data": [
    { "id": 1, "name": "Admin", "email": "admin@biblioteca.com", "role": "admin" },
    { "id": 2, "name": "João Silva", "email": "joao@email.com", "role": "user" },
    { "id": 3, "name": "Maria Souza", "email": "maria@email.com", "role": "user" },
    { "id": 4, "name": "Carlos Pereira", "email": "carlos@email.com", "role": "user" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 4, "totalPages": 1 }
}
```

### Criar usuário (admin)

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "name": "Ana Oliveira",
    "email": "ana@email.com",
    "password": "senha123",
    "role": "user"
  }'
```

```json
{ "id": 5, "name": "Ana Oliveira", "email": "ana@email.com", "role": "user" }
```

### Atualizar usuário (admin)

```bash
curl -X PUT http://localhost:3333/api/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{ "name": "João Silva Atualizado", "role": "admin" }'
```

### Erro — não autenticado (401)

```bash
curl http://localhost:3333/api/users
```

```json
{ "error": "Token não fornecido" }
```

### Erro — não é admin (403)

```bash
curl http://localhost:3333/api/users \
  -H "Authorization: Bearer TOKEN_DO_JOÃO"
```

```json
{ "error": "Acesso restrito a administradores" }
```

### Erro — email duplicado (409)

```bash
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{
    "name": "Outro Admin",
    "email": "admin@biblioteca.com",
    "password": "123456"
  }'
```

```json
{ "error": "Email já cadastrado" }
```
```
