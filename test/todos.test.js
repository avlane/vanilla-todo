'use strict';

const assert = require('assert');
const { test } = require('./harness');
const Todos = require('../public/js/todos');

test('add: appends with a fresh id', () => {
  let todos = Todos.add([], 'milk');
  todos = Todos.add(todos, 'eggs');
  assert.deepStrictEqual(todos, [
    { id: 1, title: 'milk', done: false },
    { id: 2, title: 'eggs', done: false }
  ]);
});

test('add: does not modify the original list', () => {
  const before = [{ id: 1, title: 'a', done: false }];
  Todos.add(before, 'b');
  assert.strictEqual(before.length, 1);
});

test('nextId: skips past the highest id even with gaps', () => {
  assert.strictEqual(Todos.nextId([]), 1);
  assert.strictEqual(Todos.nextId([{ id: 3 }, { id: 9 }, { id: 4 }]), 10);
});

test('toggle: flips only the matching item', () => {
  const todos = [{ id: 1, title: 'a', done: false }, { id: 2, title: 'b', done: true }];
  const out = Todos.toggle(todos, 2);
  assert.strictEqual(out[0].done, false);
  assert.strictEqual(out[1].done, false);
  assert.strictEqual(todos[1].done, true);
});

test('remove: drops the matching item', () => {
  const todos = [{ id: 1, title: 'a', done: false }, { id: 2, title: 'b', done: true }];
  assert.deepStrictEqual(Todos.remove(todos, 1).map(t => t.id), [2]);
  assert.strictEqual(Todos.remove(todos, 99).length, 2);
});
