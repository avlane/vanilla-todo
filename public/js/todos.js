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

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  // due is an optional YYYY-MM-DD string, as produced by <input type="date">.
  function add(todos, title, due) {
    const trimmed = String(title).trim();
    if (trimmed === '') return todos;
    const todo = { id: nextId(todos), title: trimmed, done: false };
    if (DATE_RE.test(due || '')) todo.due = due;
    return todos.concat([todo]);
  }

  function isOverdue(todo, today) {
    return !todo.done && Boolean(todo.due) && todo.due < today;
  }

  // Local date as YYYY-MM-DD (toISOString would give the UTC date).
  function formatDate(date) {
    const pad = n => String(n).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
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

  // Put a removed todo back at its old index (clamped to the list).
  function restore(todos, todo, index) {
    if (todos.some(t => t.id === todo.id)) return todos;
    const at = Math.max(0, Math.min(index, todos.length));
    return todos.slice(0, at).concat([todo], todos.slice(at));
  }

  // Move the item with this id so that it ends up at toIndex.
  function move(todos, id, toIndex) {
    const from = todos.findIndex(t => t.id === id);
    if (from === -1) return todos;
    const out = todos.slice();
    const item = out.splice(from, 1)[0];
    const to = Math.max(0, Math.min(toIndex, out.length));
    out.splice(to, 0, item);
    return out;
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

  // If anything is still open, finish everything; otherwise reopen everything.
  function toggleAll(todos) {
    const done = todos.some(t => !t.done);
    return todos.map(t => (t.done === done ? t : Object.assign({}, t, { done })));
  }

  return {
    nextId, add, toggle, remove, rename, parseFilter, visible, remaining, clearCompleted, toggleAll,
    isOverdue, formatDate, restore, move
  };
});
