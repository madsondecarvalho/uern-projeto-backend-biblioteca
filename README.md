# Biblioteca API (UERN)

Projeto final da disciplina **DSI0015 — Desenvolvimento Web Back-End** do curso de **Sistemas para Internet** da **UERN**.

**Aluno:** Madson Gustavo Fagundes Pinto de Carvalho

---

Projeto de backend em Node.js/Express que expõe recursos de livros, autores, categorias, cópias e reservas com camada de serviço e controlador.

## Estrutura principal
- `server.js` - inicializador do servidor e configuração global do Express.
- `src/controllers` - handlers HTTP que chamam o serviço e mapeiam erros para respostas JSON.
- `src/services` - lógica de domínio (validações, fluxo de CRUD) e lançamento de `ServiceError` quando necessário.
- `src/models` - armazenamento em memória simulando persistência e operações básicas de CRUD.
- `src/routes` - definição das rotas da API (já integrada ao `Express`).
- `tests` - suites unitários para service e controller com Jest + mocks.

## Documentação

A documentação completa da API com endpoints, schemas, exemplos curl e diagrama de classes está na pasta [`docs/`](docs/README.md).

- [Autenticação](docs/auth.md) — Login, JWT, usuários de teste
- [Livros](docs/books.md) — CRUD + filtros
- [Autores](docs/authors.md), [Categorias](docs/categories.md), [Cópias](docs/copies.md)
- [Reservas](docs/reservations.md) — Fluxo completo
- [Usuários e Roles](docs/users.md)
- [Diagrama de Classes](docs/class-diagram.md)

## Pré-requisitos
- Node.js 22 (recomendado) com npm.
- Docker e Docker Compose (para execução com banco PostgreSQL).

## Instalação

### Local (sem Docker)
```bash
npm install
```

### Com Docker Compose (recomendado)
Sobe a aplicação e o banco PostgreSQL em containers:

```bash
docker compose up -d
```

A API ficará disponível em `http://localhost:3333`.

Para parar os containers:

```bash
docker compose down
```

Para remover também o volume do banco:

```bash
docker compose down -v
```

## Execução

### Local (sem Docker)
Certifique-se de ter um PostgreSQL rodando e as variáveis de ambiente configuradas (veja `.env`), então inicie o servidor:

```bash
npm start
```

## Testes
- Execute os testes unitários com:
  ```bash
  npm test
  ```

## Notas rápidas
- A API segue ESM (`"type": "module"`) e usa o `babel-jest` para transformar os testes com Jest.
- Para alterar dados iniciais, edite `src/models/bookModel.js` (os dados ficam em memória enquanto o processo estiver ativo).

## Exemplos de `curl`
- **Listar livros:**
  ```bash
  curl http://localhost:3333/api/books
  ```
- **Buscar livro por ID:**
  ```bash
  curl http://localhost:3333/api/books/1
  ```
- **Criar livro:**
  ```bash
  curl -X POST http://localhost:3333/api/books \
    -H "Content-Type: application/json" \
    -d '{"title":"Iracema","author":"José de Alencar","year":1865,"available":true}'
  ```
- **Atualizar livro:**
  ```bash
  curl -X PUT http://localhost:3333/api/books/1 \
    -H "Content-Type: application/json" \
    -d '{"title":"Iracema","author":"J. de Alencar","year":1865,"available":false}'
  ```
- **Remover livro:**
  ```bash
  curl -X DELETE http://localhost:3333/api/books/1
  ```

