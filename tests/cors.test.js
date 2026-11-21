import {
  applyCorsHeaders,
  createCorsConfig,
  getAllowedOrigins,
  isOriginAllowed,
  parseCorsOrigins,
} from '../src/config/cors.js';

describe('configuração de CORS', () => {
  it('lê origens de FRONTEND_URLS/CORS_ORIGINS e remove caminho e barras finais', () => {
    expect(parseCorsOrigins({
      FRONTEND_URLS: 'https://front.vercel.app/, http://localhost:5173',
    })).toEqual(['https://front.vercel.app', 'http://localhost:5173']);

    expect(parseCorsOrigins({
      CORS_ORIGINS: 'https://biblioteca-frontend-projeto-uern.onrender.com/login',
    })).toEqual(['https://biblioteca-frontend-projeto-uern.onrender.com']);
  });

  it('libera qualquer origem quando a variável não está configurada', () => {
    expect(isOriginAllowed('https://qualquer.com', [])).toBe(true);
    expect(getAllowedOrigins({})).toEqual([]);
  });

  it('inclui o front oficial como fallback quando há configuração', () => {
    const origins = getAllowedOrigins({
      FRONTEND_URLS: 'https://url-antiga.example.com',
    });

    expect(origins).toContain('https://url-antiga.example.com');
    expect(origins).toContain('https://biblioteca-frontend-projeto-uern.onrender.com');
  });

  it('aceita origem exata e rejeita origem diferente', () => {
    const origins = ['https://front.vercel.app'];

    expect(isOriginAllowed('https://front.vercel.app', origins)).toBe(true);
    expect(isOriginAllowed('https://front.vercel.app/', origins)).toBe(true);
    expect(isOriginAllowed('https://malicioso.com', origins)).toBe(false);
  });

  it('aceita wildcard em subdomínios', () => {
    const origins = ['https://*.vercel.app'];

    expect(isOriginAllowed('https://biblioteca-front.vercel.app', origins)).toBe(true);
    expect(isOriginAllowed('https://outro-projeto.vercel.app', origins)).toBe(true);
    expect(isOriginAllowed('https://vercel.app', origins)).toBe(false);
  });

  it('cria opções com credentials, headers e maxAge', () => {
    const options = createCorsConfig({
      FRONTEND_URLS: 'https://front.vercel.app',
      CORS_CREDENTIALS: 'true',
      CORS_ALLOWED_HEADERS: 'Content-Type, Authorization, X-Custom',
      CORS_MAX_AGE: '600',
    });

    expect(options.credentials).toBe(true);
    expect(options.options.maxAge).toBe(600);
    expect(options.options.allowedHeaders).toEqual([
      'Content-Type',
      'Authorization',
      'X-Custom',
    ]);

    const callback = jest.fn();
    options.options.origin('https://front.vercel.app', callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('reflete headers de CORS nas respostas precoces do handler serverless', () => {
    const config = {
      origins: ['https://front.vercel.app'],
      credentials: true,
    };
    const res = { setHeader: jest.fn() };

    applyCorsHeaders(
      { headers: { origin: 'https://front.vercel.app' } },
      res,
      config
    );

    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'https://front.vercel.app'
    );
    expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Origin');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Credentials',
      'true'
    );
  });

  it('não adiciona headers para origem não permitida', () => {
    const res = { setHeader: jest.fn() };

    applyCorsHeaders(
      { headers: { origin: 'https://malicioso.com' } },
      res,
      { origins: ['https://front.vercel.app'], credentials: false }
    );

    expect(res.setHeader).not.toHaveBeenCalled();
  });
});
