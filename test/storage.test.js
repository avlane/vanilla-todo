'use strict';

const assert = require('assert');
const { test } = require('./harness');
const TodoStorage = require('../public/js/storage');

function fakeStorage(initial) {
  const data = new Map(Object.entries(initial || {}));
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    raw: k => data.get(k)
  };
}

const sample = [{ id: 1, title: 'a', done: false }, { id: 2, title: 'b', done: true }];

test('storage: round trip', () => {
  const backing = fakeStorage();
  const store = TodoStorage.create(backing, 'k');
  assert.deepStrictEqual(store.load(), []);
  assert.strictEqual(store.save(sample), true);
  assert.deepStrictEqual(TodoStorage.create(backing, 'k').load(), sample);
  assert.strictEqual(JSON.parse(backing.raw('k')).version, 1);
});

test('storage: reads the old bare-array format', () => {
  const backing = fakeStorage({ k: JSON.stringify(sample) });
  assert.deepStrictEqual(TodoStorage.create(backing, 'k').load(), sample);
});

test('storage: corrupt data gives an empty list', () => {
  assert.deepStrictEqual(TodoStorage.create(fakeStorage({ k: '{nope' }), 'k').load(), []);
  assert.deepStrictEqual(TodoStorage.create(fakeStorage({ k: '"text"' }), 'k').load(), []);
  assert.deepStrictEqual(TodoStorage.create(fakeStorage({ k: 'null' }), 'k').load(), []);
});

test('storage: malformed entries are dropped', () => {
  const bad = [sample[0], { id: 'x', title: 'b', done: true }, null, { id: 3, title: 4, done: false }];
  const store = TodoStorage.create(fakeStorage({ k: JSON.stringify({ version: 1, todos: bad }) }), 'k');
  assert.deepStrictEqual(store.load(), [sample[0]]);
});

test('storage: a throwing setItem reports failure but keeps working', () => {
  const full = { getItem: () => null, setItem() { throw new Error('QuotaExceededError'); } };
  const store = TodoStorage.create(full, 'k');
  assert.strictEqual(store.save(sample), false);
});

test('storage: without any storage the list lives in memory', () => {
  const store = TodoStorage.create(null, 'k');
  assert.deepStrictEqual(store.load(), []);
  assert.strictEqual(store.save(sample), false);
  assert.deepStrictEqual(store.load(), sample);
});
