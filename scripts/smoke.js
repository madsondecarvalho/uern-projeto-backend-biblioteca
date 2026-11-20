// Smoke test de ponta a ponta: assume que a API já está rodando e que
// `npm run db:setup` foi executado (schema + dados de demonstração).
const baseUrl =
  process.env.SMOKE_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || 3333}/api`;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: response.status, body };
};

const expectStatus = (result, expected, label) => {
  if (result.status !== expected) {
    throw new Error(
      `${label}: esperado HTTP ${expected}, recebido ${result.status} — ` +
      JSON.stringify(result.body)
    );
  }
};

const json = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const health = await request('/health');
expectStatus(health, 200, 'health');
if (health.body.status !== 'ok' || health.body.database !== 'up') {
  throw new Error(`health inesperado: ${JSON.stringify(health.body)}`);
}

const books = await request('/books?limit=1');
expectStatus(books, 200, 'listar livros');
if (!books.body.data?.[0]?.Author || !books.body.data?.[0]?.Category) {
  throw new Error('listagem de livros sem Author/Category aninhados');
}

const loginUser = await request('/login', json({
  email: 'joao@email.com',
  password: 'senha123',
}));
expectStatus(loginUser, 200, 'login do usuário');
if (!loginUser.body.token) throw new Error('login sem token');

const loginAdmin = await request('/login', json({
  email: 'admin@biblioteca.com',
  password: 'admin123',
}));
expectStatus(loginAdmin, 200, 'login do admin');

const users = await request('/users', {
  headers: auth(loginAdmin.body.token),
});
expectStatus(users, 200, 'listar usuários');
if (JSON.stringify(users.body).includes('"password"')) {
  throw new Error('resposta de usuários expôs o campo password');
}

const copies = await request('/copies?status=AVAILABLE&limit=1');
expectStatus(copies, 200, 'listar cópias disponíveis');
const copy = copies.body.data?.[0];
if (!copy) throw new Error('nenhuma cópia disponível para o smoke test');

const reservation = await request('/reservations', {
  ...json({ copyId: copy.id }),
  headers: { 'Content-Type': 'application/json', ...auth(loginUser.body.token) },
});
expectStatus(reservation, 201, 'criar reserva');
if (reservation.body.Copy?.Book?.id !== copy.bookId) {
  throw new Error('reserva criada sem Copy.Book aninhados');
}

const pickedUp = await request(`/reservations/${reservation.body.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', ...auth(loginAdmin.body.token) },
  body: JSON.stringify({ status: 'PICKED_UP' }),
});
expectStatus(pickedUp, 200, 'confirmar retirada');
if (pickedUp.body.status !== 'PICKED_UP') {
  throw new Error(`status da reserva inesperado: ${pickedUp.body.status}`);
}

const copyAfter = await request(`/copies/${copy.id}`);
expectStatus(copyAfter, 200, 'buscar cópia');
if (copyAfter.body.status !== 'BORROWED') {
  throw new Error(`status da cópia inesperado: ${copyAfter.body.status}`);
}

console.log(
  `Smoke OK: health, livros, login, usuários, cópias e reservas (reserva #${reservation.body.id}).`
);
