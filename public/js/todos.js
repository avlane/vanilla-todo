(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Todos = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function nextId(todos) {
    return todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  function add(todos, title) {
    const trimmed = String(title).trim();
    if (trimmed === '') return todos;
    return todos.concat([{ id: nextId(todos), title: trimmed, done: false }]);
  }

  function toggle(todos, id) {
    return todos.map(t => (t.id === id ? Object.assign({}, t, { done: !t.done }) : t));
  }

  function remove(todos, id) {
    return todos.filter(t => t.id !== id);
  }

  // A blank title deletes the todo, like clearing the field in most todo apps.
  function rename(todos, id, title) {
    const trimmed = String(title).trim();
    if (trimmed === '') return remove(todos, id);
    return todos.map(t => (t.id === id ? Object.assign({}, t, { title: trimmed }) : t));
  }

  const FILTERS = ['all', 'active', 'completed'];

  // '#/active' -> 'active'; anything unknown means 'all'.
  function parseFilter(hash) {
    const name = String(hash || '').replace(/^#\/?/, '');
    return FILTERS.includes(name) ? name : 'all';
  }

  function visible(todos, filter) {
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'completed') return todos.filter(t => t.done);
    return todos;
  }

  function remaining(todos) {
    return todos.filter(t => !t.done).length;
  }

  function clearCompleted(todos) {
    return todos.filter(t => !t.done);
  }

  return { nextId, add, toggle, remove, rename, parseFilter, visible, remaining, clearCompleted };
});
