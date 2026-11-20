# Health Check

Verifica se a API está no ar e se o PostgreSQL está respondendo. Não exige autenticação.

```
GET /api/health
```

### Resposta `200` — tudo operacional

```json
{
  "status": "ok",
  "database": "up",
  "uptime": 123,
  "timestamp": "2026-11-20T12:00:00.000Z"
}
```

### Resposta `503` — API no ar, banco indisponível

```json
{
  "status": "degraded",
  "database": "down",
  "uptime": 123,
  "timestamp": "2026-11-20T12:00:00.000Z"
}
```

| Campo | Descrição |
|-------|-----------|
| `status` | `ok` quando o banco responde; `degraded` quando não responde |
| `database` | Estado da conexão com o PostgreSQL (`up` ou `down`) |
| `uptime` | Tempo de atividade do processo em segundos |
| `timestamp` | Momento da verificação (ISO 8601) |

### Exemplo

```bash
curl http://localhost:3333/api/health
```
