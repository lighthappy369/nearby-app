import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.NODE_ENV = 'test';
process.env.AUTH_SECRET = 'test-secret';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

const { handler } = await import('../src/index.js');

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function requestJson(port, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...headers
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, json, text });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test('POST /matches requires auth', async () => {
  const { server, port } = await startServer();
  try {
    const res = await requestJson(port, 'POST', '/matches', { userA: 'a', userB: 'b' });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('POST /stripe/webhook invalid json returns 400', async () => {
  const { server, port } = await startServer();
  try {
    const res = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        path: '/stripe/webhook',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-stripe-signature': 'whsec_test'
        }
      }, (resp) => {
        const chunks = [];
        resp.on('data', (d) => chunks.push(d));
        resp.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: resp.statusCode, text });
        });
      });
      req.on('error', reject);
      req.write('{invalid json');
      req.end();
    });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});


test('POST /community/messages blocks unsafe content', async () => {
  const { server, port } = await startServer();
  try {
    const res = await requestJson(port, 'POST', '/community/messages', {
      alias: 'Anon',
      text: 'mailim test@example.com',
      lang: 'tr'
    });
    assert.equal(res.status, 422);
  } finally {
    server.close();
  }
});

test('POST /ai/depth-analysis returns profile', async () => {
  const { server, port } = await startServer();
  try {
    const res = await requestJson(port, 'POST', '/ai/depth-analysis', {
      text: 'İlişkide güven, anlam ve duygusal derinlik benim için önemli.'
    });
    assert.equal(res.status, 200);
    assert.equal(typeof res.json.analysis.profile.depth, 'number');
  } finally {
    server.close();
  }
});
