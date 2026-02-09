import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { saveUser, findUserById, listOtherUsers, saveMatch, listMatchesForUser } from './data/store.js';
import { rankCandidates, calculateCompatibility } from './services/matchEngine.js';
import { generateIceBreakers, explainScore } from './services/aiCoach.js';

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
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

async function handler(req, res) {
  const path = parsePath(req.url);
  const method = req.method;

  try {
    if (method === 'GET' && path === '/health') {
      return sendJson(res, 200, { ok: true, service: 'empati-ai-mvp' });
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
