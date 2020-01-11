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

test('parseFilter: reads the hash', () => {
  assert.strictEqual(Todos.parseFilter('#/active'), 'active');
  assert.strictEqual(Todos.parseFilter('#/completed'), 'completed');
  assert.strictEqual(Todos.parseFilter('#/'), 'all');
  assert.strictEqual(Todos.parseFilter(''), 'all');
  assert.strictEqual(Todos.parseFilter('#/bogus'), 'all');
  assert.strictEqual(Todos.parseFilter(undefined), 'all');
});

test('visible: filters by state', () => {
  const todos = [{ id: 1, title: 'a', done: false }, { id: 2, title: 'b', done: true }];
  assert.deepStrictEqual(Todos.visible(todos, 'all').map(t => t.id), [1, 2]);
  assert.deepStrictEqual(Todos.visible(todos, 'active').map(t => t.id), [1]);
  assert.deepStrictEqual(Todos.visible(todos, 'completed').map(t => t.id), [2]);
});

test('rename: trims and replaces the title', () => {
  const todos = [{ id: 1, title: 'a', done: true }, { id: 2, title: 'b', done: false }];
  const out = Todos.rename(todos, 1, '  new name  ');
  assert.deepStrictEqual(out[0], { id: 1, title: 'new name', done: true });
  assert.strictEqual(out[1], todos[1]);
});

test('rename: a blank title removes the todo', () => {
  const todos = [{ id: 1, title: 'a', done: false }];
  assert.deepStrictEqual(Todos.rename(todos, 1, '   '), []);
});

test('remaining: counts open items', () => {
  const todos = [{ id: 1, done: false }, { id: 2, done: true }, { id: 3, done: false }];
  assert.strictEqual(Todos.remaining(todos), 2);
  assert.strictEqual(Todos.remaining([]), 0);
});

test('clearCompleted: keeps only open items', () => {
  const todos = [{ id: 1, done: false }, { id: 2, done: true }, { id: 3, done: false }];
  assert.deepStrictEqual(Todos.clearCompleted(todos).map(t => t.id), [1, 3]);
});

test('add: trims the title', () => {
  assert.strictEqual(Todos.add([], '  milk \n')[0].title, 'milk');
});

test('add: ignores blank titles', () => {
  const todos = [{ id: 1, title: 'a', done: false }];
  assert.strictEqual(Todos.add(todos, ''), todos);
  assert.strictEqual(Todos.add(todos, '   \t'), todos);
});

test('toggleAll: completes everything when something is open', () => {
  const todos = [{ id: 1, done: false }, { id: 2, done: true }];
  assert.deepStrictEqual(Todos.toggleAll(todos).map(t => t.done), [true, true]);
});

test('toggleAll: reopens everything when all are done', () => {
  const todos = [{ id: 1, done: true }, { id: 2, done: true }];
  assert.deepStrictEqual(Todos.toggleAll(todos).map(t => t.done), [false, false]);
  assert.deepStrictEqual(Todos.toggleAll([]), []);
});
