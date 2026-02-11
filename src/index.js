import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  saveUser,
  findUserById,
  findUserByEmail,
  listOtherUsers,
  saveMatch,
  listMatchesForUser,
  setSubscription,
  getSubscription,
  saveEvent,
  listEvents
} from './data/store.js';
import { rankCandidates, calculateCompatibility } from './services/matchEngine.js';
import { generateIceBreakers, explainScore } from './services/aiCoach.js';
import { listJungQuestions, scoreJungAnswers } from './services/jungEngine.js';
import { makeSalt, hashPassword, createToken, verifyToken, bearerToken } from './services/auth.js';
import { validateEventName } from './services/tracking.js';

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function parsePath(url) {
  return url.split('?')[0].replace(/\/+$/, '') || '/';
}

async function serveHome(res) {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  return sendHtml(res, 200, html);
}

async function serveLaunch(res) {
  let html = await readFile(new URL('../public/launch.html', import.meta.url), 'utf8');
  html = html.replace('__STRIPE_PAYMENT_LINK__', process.env.STRIPE_PAYMENT_LINK || '#');
  return sendHtml(res, 200, html);
}

function authUser(req) {
  const token = bearerToken(req);
  const payload = verifyToken(token);
  if (!payload?.sub) return null;
  return findUserById(payload.sub);
}

async function handler(req, res) {
  const path = parsePath(req.url);
  const method = req.method;

  try {
    if (method === 'GET' && path === '/') return serveHome(res);
    if (method === 'GET' && path === '/launch') return serveLaunch(res);

    if (method === 'GET' && path === '/health') {
      return sendJson(res, 200, { ok: true, service: 'empati-ai-mvp' });
    }

    if (method === 'POST' && path === '/auth/register') {
      const { email, password, age = 18, language = 'tr' } = await readBody(req);
      if (!email || !password) return sendJson(res, 400, { error: 'email and password required.' });
      if (findUserByEmail(email)) return sendJson(res, 409, { error: 'email already used.' });
      if (age < 15) return sendJson(res, 400, { error: 'Minimum age is 15.' });

      const salt = makeSalt();
      const user = saveUser({
        id: randomUUID(),
        email,
        passwordHash: hashPassword(password, salt),
        salt,
        age,
        language,
        interests: [],
        values: [],
        lifestyle: [],
        createdAt: new Date().toISOString()
      });

      const token = createToken({ sub: user.id, email: user.email });
      return sendJson(res, 201, { token, user: { id: user.id, email: user.email, age: user.age } });
    }

    if (method === 'POST' && path === '/auth/login') {
      const { email, password } = await readBody(req);
      const user = findUserByEmail(email);
      if (!user) return sendJson(res, 401, { error: 'invalid credentials.' });
      const ok = hashPassword(password, user.salt) === user.passwordHash;
      if (!ok) return sendJson(res, 401, { error: 'invalid credentials.' });
      const token = createToken({ sub: user.id, email: user.email });
      return sendJson(res, 200, { token, user: { id: user.id, email: user.email, age: user.age } });
    }

    if (method === 'GET' && path === '/me') {
      const user = authUser(req);
      if (!user) return sendJson(res, 401, { error: 'unauthorized.' });
      return sendJson(res, 200, {
        user: { id: user.id, email: user.email, age: user.age, language: user.language },
        subscription: getSubscription(user.id)
      });
    }

    if (method === 'POST' && path === '/events') {
      const user = authUser(req);
      const { name, metadata = {} } = await readBody(req);
      if (!validateEventName(name)) return sendJson(res, 400, { error: 'unsupported event name.' });
      const row = saveEvent({ userId: user?.id || null, name, metadata });
      return sendJson(res, 201, row);
    }

    if (method === 'GET' && path === '/events') {
      return sendJson(res, 200, { items: listEvents(100) });
    }

    if (method === 'POST' && path === '/stripe/webhook') {
      const { type, data = {} } = await readBody(req);
      const signature = req.headers['x-stripe-signature'];
      if ((process.env.STRIPE_WEBHOOK_SECRET || '') && signature !== process.env.STRIPE_WEBHOOK_SECRET) {
        return sendJson(res, 401, { error: 'invalid webhook signature.' });
      }

      if (type === 'checkout.session.completed') {
        const userId = data?.metadata?.userId;
        if (userId) setSubscription(userId, 'active', { provider: 'stripe', plan: data?.metadata?.plan || 'monthly' });
      }

      if (type === 'customer.subscription.deleted') {
        const userId = data?.metadata?.userId;
        if (userId) setSubscription(userId, 'canceled', { provider: 'stripe' });
      }

      return sendJson(res, 200, { received: true, type });
    }

    if (method === 'GET' && path === '/jung/questions') {
      return sendJson(res, 200, { items: listJungQuestions() });
    }

    if (method === 'POST' && path === '/jung/score') {
      const { answers = [] } = await readBody(req);
      const result = scoreJungAnswers(answers);
      if (answers.length > 0) {
        saveEvent({ userId: null, name: 'test_completed', metadata: { type: result.type, completionRate: result.quality.completionRate } });
      }
      return sendJson(res, 200, result);
    }

    if (method === 'POST' && path === '/users') {
      const { age, language, interests = [], values = [], lifestyle = [], location } = await readBody(req);
      if (!age || age < 15) return sendJson(res, 400, { error: 'Minimum age is 15.' });

      const user = { id: randomUUID(), age, language, interests, values, lifestyle, location, createdAt: new Date().toISOString() };
      saveUser(user);
      return sendJson(res, 201, user);
    }

    const recMatch = path.match(/^\/users\/([^/]+)\/recommendations$/);
    if (method === 'GET' && recMatch) {
      const user = findUserById(recMatch[1]);
      if (!user) return sendJson(res, 404, { error: 'User not found.' });

      const items = rankCandidates(user, listOtherUsers(user.id)).slice(0, 20).map(({ candidate, score, breakdown }) => ({
        candidateId: candidate.id,
        score,
        breakdown,
        aiReason: explainScore(breakdown),
        iceBreakers: generateIceBreakers(user, candidate, breakdown)
      }));
      return sendJson(res, 200, { total: items.length, items });
    }

    if (method === 'POST' && path === '/matches') {
      const { userA, userB } = await readBody(req);
      const first = findUserById(userA);
      const second = findUserById(userB);
      if (!first || !second) return sendJson(res, 404, { error: 'Both users must exist.' });

      const { score, breakdown } = calculateCompatibility(first, second);
      const match = saveMatch({ id: randomUUID(), userA, userB, score, breakdown, createdAt: new Date().toISOString() });
      return sendJson(res, 201, {
        ...match,
        aiReason: explainScore(breakdown),
        suggestedOpeners: generateIceBreakers(first, second, breakdown)
      });
    }

    const userMatch = path.match(/^\/users\/([^/]+)\/matches$/);
    if (method === 'GET' && userMatch) {
      const user = findUserById(userMatch[1]);
      if (!user) return sendJson(res, 404, { error: 'User not found.' });
      return sendJson(res, 200, { items: listMatchesForUser(user.id) });
    }

    if (method === 'POST' && path === '/moderation/report') {
      const reporter = authUser(req);
      const { targetUserId, reason } = await readBody(req);
      if (!targetUserId || !reason) return sendJson(res, 400, { error: 'targetUserId and reason required.' });
      const row = saveEvent({ userId: reporter?.id || null, name: 'moderation_report', metadata: { targetUserId, reason } });
      return sendJson(res, 201, row);
    }

    return sendJson(res, 404, { error: 'Route not found.' });
  } catch (error) {
    return sendJson(res, 500, { error: 'Internal error.', details: error.message });
  }
}

const server = http.createServer(handler);
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`empati api running on :${port}`);
  });
}

export { handler };
