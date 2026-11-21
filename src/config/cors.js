const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

// Front oficial do projeto. Serve de fallback quando a variável de ambiente
// estiver ausente ou contiver uma URL antiga/incorreta com caminho.
const DEFAULT_FRONTEND_ORIGINS = [
  'https://biblioteca-frontend-projeto-uern.onrender.com',
];

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Aceita URL completa com caminho (/login) e converte para origin.
const normalizeOrigin = (value) => {
  const trimmed = value.trim();

  if (!trimmed) return '';
  if (trimmed.includes('*')) return trimmed.replace(/\/+$/, '');

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
};

const escapeRegex = (value) => value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

const matchesOrigin = (origin, allowed) => {
  const normalizedAllowed = normalizeOrigin(allowed);

  if (normalizedAllowed === '*') return true;

  if (!normalizedAllowed.includes('*')) {
    return origin.toLowerCase() === normalizedAllowed.toLowerCase();
  }

  const pattern = escapeRegex(normalizedAllowed).replace(/\*/g, '.*');
  return new RegExp(`^${pattern}$`, 'i').test(origin);
};

// Aceita CORS_ORIGINS, FRONTEND_URLS, FRONTEND_URL ou CORS_ORIGIN.
// Vários origins são separados por vírgula. Também aceita curingas,
// como https://*.vercel.app.
export const parseCorsOrigins = (env = process.env) => {
  const raw =
    env.CORS_ORIGINS ||
    env.FRONTEND_URLS ||
    env.FRONTEND_URL ||
    env.CORS_ORIGIN ||
    '';

  return parseList(raw).map(normalizeOrigin);
};

export const isOriginAllowed = (origin, origins = []) => {
  if (!origin) return true;
  if (origins.length === 0) return true; // sem configuração: liberado (dev)

  const normalized = normalizeOrigin(origin);
  return origins.some((allowed) => matchesOrigin(normalized, allowed));
};

// Mantém o comportamento aberto quando não há configuração (desenvolvimento).
// Quando há configuração, inclui o front oficial como fallback para não
// quebrar caso a variável esteja com uma URL antiga ou com caminho.
export const getAllowedOrigins = (env = process.env) => {
  const configured = parseCorsOrigins(env);

  if (configured.length === 0) return [];

  return [...new Set([...configured, ...DEFAULT_FRONTEND_ORIGINS])];
};

export const createCorsConfig = (env = process.env) => {
  const origins = getAllowedOrigins(env);
  const allowedHeaders = parseList(env.CORS_ALLOWED_HEADERS);
  const credentials = String(env.CORS_CREDENTIALS || '').toLowerCase() === 'true';
  const parsedMaxAge = Number(env.CORS_MAX_AGE);

  const options = {
    origin(origin, callback) {
      callback(null, isOriginAllowed(origin, origins));
    },
    methods: ALLOWED_METHODS,
    credentials,
    maxAge: Number.isFinite(parsedMaxAge) ? parsedMaxAge : 86400,
    optionsSuccessStatus: 204,
    // Sem lista explícita, o pacote cors reflete os headers pedidos no preflight.
    ...(allowedHeaders.length > 0 ? { allowedHeaders } : {}),
  };

  return { origins, credentials, options };
};

export const corsConfig = createCorsConfig();
export const corsOptions = corsConfig.options;

// Usado nas respostas precoces do handler serverless (Vercel), antes do Express.
export const applyCorsHeaders = (req, res, config = corsConfig) => {
  const origin = req.headers?.origin;

  if (!origin || !isOriginAllowed(origin, config.origins)) return;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');

  if (config.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
};

export default corsOptions;
