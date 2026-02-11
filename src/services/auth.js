import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_ISSUER = 'empati';

function tokenSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV !== 'production') return 'empati-dev-secret';
  return null;
}

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

export function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

export function makeSalt() {
  return sha256(`${Date.now()}-${Math.random()}`).slice(0, 16);
}

export function createToken(payload, options = {}) {
  const secret = tokenSecret();
  if (!secret) {
    throw new Error('AUTH_SECRET is required to create tokens.');
  }

  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = Number(options.ttlSeconds ?? TOKEN_TTL_SECONDS);
  const bodyPayload = {
    ...payload,
    iss: TOKEN_ISSUER,
    iat: now,
    exp: now + ttlSeconds
  };

  const body = Buffer.from(JSON.stringify(bodyPayload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  const secret = tokenSecret();
  if (!secret || !token || !token.includes('.')) return null;

  const [body, signature] = token.split('.');
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.sub || !payload?.exp || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function bearerToken(req) {
  const raw = req.headers.authorization || '';
  const [type, token] = raw.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}
