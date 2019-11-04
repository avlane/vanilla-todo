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
    return todos.concat([{ id: nextId(todos), title, done: false }]);
  }

  function toggle(todos, id) {
    return todos.map(t => (t.id === id ? Object.assign({}, t, { done: !t.done }) : t));
  }

  function remove(todos, id) {
    return todos.filter(t => t.id !== id);
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

  return { nextId, add, toggle, remove, parseFilter, visible };
});
