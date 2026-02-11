import test from 'node:test';
import assert from 'node:assert/strict';
import { createToken, verifyToken, hashPassword, makeSalt } from '../src/services/auth.js';

test('token roundtrip works', () => {
  const token = createToken({ sub: 'user-1', email: 'u@example.com' });
  const payload = verifyToken(token);
  assert.equal(payload.sub, 'user-1');
});

test('password hash is deterministic with same salt', () => {
  const salt = makeSalt();
  assert.equal(hashPassword('secret', salt), hashPassword('secret', salt));
});
