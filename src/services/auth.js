import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'empati-dev-secret';

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

export function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

export function makeSalt() {
  return sha256(`${Date.now()}-${Math.random()}`).slice(0, 16);
}

export function createToken(payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const expected = createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
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
