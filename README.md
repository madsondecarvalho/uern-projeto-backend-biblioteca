# Biblioteca API (UERN)

Projeto de backend simples em Node.js/Express que expõe recursos de livros com camada de serviço e controlador.

## Estrutura principal
- `server.js` - inicializador do servidor e configuração global do Express.
- `src/controllers` - handlers HTTP que chamam o serviço e mapeiam erros para respostas JSON.
- `src/services` - lógica de domínio (validações, fluxo de CRUD) e lançamento de `ServiceError` quando necessário.
- `src/models` - armazenamento em memória simulando persistência e operações básicas de CRUD.
- `src/routes` - definição das rotas da API (já integrada ao `Express`).
- `tests` - suites unitários para service e controller com Jest + mocks.

## Pré-requisitos
- Node.js 22 (recomendado) com npm.

## Instalação
```bash
npm install
```

## Execução
- Inicie o servidor em modo normal:
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

