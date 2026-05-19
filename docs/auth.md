# Autenticação

## Login

Obtém um token JWT para autenticação nas demais rotas.

```
POST /api/login
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| email | string | sim |
| password | string | sim |

### Exemplo

```bash
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@biblioteca.com", "password": "admin123" }'
```

Resposta `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@biblioteca.com",
    "role": "admin"
  }
}
```

### Usando o Token

Inclua o token no header `Authorization` das requisições autenticadas:

```bash
curl http://localhost:3333/api/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Usuários de Teste

| Nome | Email | Senha | Role |
|------|-------|-------|------|
| Admin | admin@biblioteca.com | admin123 | admin |
| João Silva | joao@email.com | senha123 | user |
| Maria Souza | maria@email.com | senha123 | user |
| Carlos Pereira | carlos@email.com | senha123 | user |
```
