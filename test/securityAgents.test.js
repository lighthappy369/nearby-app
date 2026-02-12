import test from 'node:test';
import assert from 'node:assert/strict';
import { runSecurityAgents } from '../src/services/securityAgents.js';

test('security agents allow clean text', () => {
  const result = runSecurityAgents('Bugün daha derin bir sohbet yapmak istiyorum.');
  assert.equal(result.safeToPublish, true);
  assert.equal(result.trust.score > 50, true);
});

test('security agents block toxic or pii text', () => {
  const toxic = runSecurityAgents('Sen aptal birisin.');
  assert.equal(toxic.safeToPublish, false);

  const pii = runSecurityAgents('Bana test@example.com adresinden yaz.');
  assert.equal(pii.safeToPublish, false);
});
