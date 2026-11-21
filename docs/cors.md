# CORS

A API libera requisições cross-origin para os fronts configurados nas variáveis de ambiente.

A implementação fica em [`src/config/cors.js`](../src/config/cors.js) e é aplicada no Express antes do parser JSON, garantindo headers também em preflight e erros de body inválido.

## Variáveis

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `FRONTEND_URLS` | Recomendada | Origins completos separados por vírgula, por exemplo `https://meu-front.onrender.com,http://localhost:5173` |
| `CORS_ORIGINS` | Alternativa | Alias para `FRONTEND_URLS` |
| `FRONTEND_URL` | Alternativa | Um único origin (compatibilidade) |
| `CORS_ORIGIN` | Alternativa | Alias singular |
| `CORS_CREDENTIALS` | Opcional | `true` para enviar `Access-Control-Allow-Credentials` (cookies/credenciais) |
| `CORS_ALLOWED_HEADERS` | Opcional | Lista de headers permitidos; se omitida, o CORS reflete os headers do preflight |
| `CORS_MAX_AGE` | Opcional | Cache do preflight em segundos (padrão `86400`) |

Ordem de precedência:

```
CORS_ORIGINS > FRONTEND_URLS > FRONTEND_URL > CORS_ORIGIN
```

### Regras de formato

- Use o **origin** completo: protocolo + host + porta.
- Não use barra final:
  - Correto: `https://meu-front.onrender.com`
  - Errado: `https://meu-front.onrender.com/`
- Se colar uma URL com caminho, como `https://meu-front.onrender.com/login`, o backend normaliza para o origin `https://meu-front.onrender.com`.
- Separe múltiplos origins por vírgula.
- Curingas são aceitos: `https://*.onrender.com`.
- Sem nenhuma variável configurada, a API libera qualquer origem (útil apenas em desenvolvimento).
- Quando existe configuração, o front oficial `https://biblioteca-frontend-projeto-uern.onrender.com` também é incluído como fallback.

## Exemplos

Front em produção:

```env
FRONTEND_URLS=https://biblioteca-frontend-projeto-uern.onrender.com
```

Produção + desenvolvimento local:

```env
FRONTEND_URLS=https://biblioteca-frontend-projeto-uern.onrender.com,http://localhost:3000,http://localhost:5173
```

Front com cookies/credenciais:

```env
FRONTEND_URLS=https://biblioteca-frontend-projeto-uern.onrender.com
CORS_CREDENTIALS=true
```

Múltiplos subdomínios:

```env
FRONTEND_URLS=https://biblioteca-frontend-projeto-uern.onrender.com,https://*.onrender.com
```

> Evite `https://*.onrender.com` em produção se não precisar liberar outros serviços. Prefira o domínio fixo.

## Onde configurar

### Desenvolvimento local

No `.env`:

```env
FRONTEND_URLS=http://localhost:3000,http://localhost:5173
```

### Render

Em **Settings → Environment Variables**, adicione `FRONTEND_URLS` com a URL real do front:

```env
FRONTEND_URLS=https://biblioteca-frontend-projeto-uern.onrender.com
```

Depois de alterar variáveis de ambiente, o Render precisa de um novo deploy para aplicar.

### Vercel (API serverless)

Se a API estiver na Vercel, configure `FRONTEND_URLS` em **Settings → Environment Variables** do projeto da API. O preflight (`OPTIONS`) não passa pela checagem de banco, então responde mesmo com o banco indisponível.

## Como testar

Com a API rodando:

```bash
curl -i -X OPTIONS http://localhost:3333/api/books \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Resposta esperada: status `204` e headers parecidos com:

```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: authorization,content-type
Vary: Origin
```

Origem não configurada:

```bash
curl -i -X OPTIONS http://localhost:3333/api/books \
  -H "Origin: https://origem-nao-configurada.com" \
  -H "Access-Control-Request-Method: GET"
```

Nesse caso, o header `Access-Control-Allow-Origin` não deve aparecer.

## Problemas comuns

| Sintoma no browser | Causa provável | Solução |
|--------------------|----------------|---------|
| `No 'Access-Control-Allow-Origin' header` | Origin fora da lista | Confira `FRONTEND_URLS` no ambiente correto |
| Erro só em produção | Variável não configurada no Render/Vercel | Cadastre e faça novo deploy |
| Erro após colar a URL | Barra final ou caminho na variável | Use só `protocolo://host[:porta]` |
| Preflight falha | Headers customizados não permitidos | Deixe `CORS_ALLOWED_HEADERS` vazio (reflete o pedido) ou inclua o header |
| Funciona com token, falha com cookies | Credenciais desabilitadas | Defina `CORS_CREDENTIALS=true` |
| Erro em preview/subdomínio | URL de preview muda | Adicione um curinga ou o domínio de preview |
| `503` no `/api/health` | Banco indisponível, não CORS | Verifique Turso e migrations |

## Segurança

- Configure apenas os fronts que realmente devem acessar a API.
- Não use `*` em produção.
- Trate `FRONTEND_URLS` como configuração pública (não é segredo), mas evite liberar origens desconhecidas.
- Se usar cookies, mantenha `CORS_CREDENTIALS=true` e nunca combine com `Access-Control-Allow-Origin: *`.
