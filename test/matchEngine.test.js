import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCompatibility, rankCandidates } from '../src/services/matchEngine.js';

test('calculateCompatibility returns deterministic weighted score', () => {
  const a = {
    interests: ['music', 'travel'],
    values: ['honesty', 'family'],
    lifestyle: ['early-riser'],
    location: { lat: 52.52, lon: 13.405 }
  };
  const b = {
    interests: ['music', 'books'],
    values: ['honesty', 'growth'],
    lifestyle: ['early-riser'],
    location: { lat: 52.53, lon: 13.39 }
  };

  const result = calculateCompatibility(a, b);
  assert.equal(typeof result.score, 'number');
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.breakdown.interest > 0);
});

test('rankCandidates sorts by descending score', () => {
  const user = {
    interests: ['music'],
    values: ['honesty'],
    lifestyle: ['active'],
    location: { lat: 52.52, lon: 13.405 }
  };
  const candidates = [
    { id: 'c1', interests: ['music'], values: ['honesty'], lifestyle: ['active'], location: { lat: 52.52, lon: 13.405 } },
    { id: 'c2', interests: ['games'], values: ['wealth'], lifestyle: ['night-owl'], location: { lat: 48.13, lon: 11.58 } }
  ];

  const ranked = rankCandidates(user, candidates);
  assert.equal(ranked[0].candidate.id, 'c1');
});
