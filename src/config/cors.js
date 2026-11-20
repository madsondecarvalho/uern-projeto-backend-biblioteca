const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeOrigin = (value) => value.trim().replace(/\/+$/, '');

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

export const createCorsConfig = (env = process.env) => {
  const origins = parseCorsOrigins(env);
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
