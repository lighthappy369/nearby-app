import test from 'node:test';
import assert from 'node:assert/strict';
import { listJungQuestions, scoreJungAnswers } from '../src/services/jungEngine.js';

test('listJungQuestions returns 30 public question payload', () => {
  const items = listJungQuestions();
  assert.equal(items.length, 30);
  assert.ok(items[0].id);
  assert.equal(Array.isArray(items[0].scale), true);
});

test('scoreJungAnswers returns type, archetype and quality', () => {
  const answers = listJungQuestions().map((q, i) => ({ id: q.id, value: (i % 5) + 1 }));
  const result = scoreJungAnswers(answers);
  assert.equal(result.type.length, 4);
  assert.equal(typeof result.archetype, 'string');
  assert.equal(typeof result.quality.completionRate, 'number');
  assert.equal(result.quality.completionRate, 100);
});
