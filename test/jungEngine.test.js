import test from 'node:test';
import assert from 'node:assert/strict';
import { listJungQuestions, scoreJungAnswers } from '../src/services/jungEngine.js';

test('listJungQuestions returns public question payload', () => {
  const items = listJungQuestions();
  assert.ok(items.length >= 10);
  assert.ok(items[0].id);
  assert.equal(Array.isArray(items[0].scale), true);
});

test('scoreJungAnswers returns type and archetype', () => {
  const answers = [
    { id: 'q1', value: 5 },
    { id: 'q2', value: 4 },
    { id: 'q3', value: 5 },
    { id: 'q4', value: 5 },
    { id: 'q5', value: 1 },
    { id: 'q6', value: 5 },
    { id: 'q7', value: 2 },
    { id: 'q8', value: 1 },
    { id: 'q9', value: 4 },
    { id: 'q10', value: 2 }
  ];

  const result = scoreJungAnswers(answers);
  assert.equal(result.type.length, 4);
  assert.equal(typeof result.archetype, 'string');
});
