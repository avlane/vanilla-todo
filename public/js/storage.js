(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TodoStorage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSION = 1;

  function isValidTodo(t) {
    return Boolean(t) && typeof t === 'object' &&
      Number.isInteger(t.id) && typeof t.title === 'string' && typeof t.done === 'boolean' &&
      (t.due === undefined || typeof t.due === 'string');
  }

  function sanitize(list) {
    return Array.isArray(list) ? list.filter(isValidTodo) : [];
  }

  function serialize(todos) {
    return JSON.stringify({ version: VERSION, todos }, null, 2) + '\n';
  }

  // Parses an exported file (or the old bare array). Throws a readable Error.
  function parseImport(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error('That file is not valid JSON.');
    }
    const list = Array.isArray(data) ? data : data && data.todos;
    if (!Array.isArray(list)) throw new Error('No todo list found in that file.');
    const todos = sanitize(list);
    if (todos.length !== list.length) {
      throw new Error((list.length - todos.length) + ' of ' + list.length + ' items are not valid todos.');
    }
    return todos;
  }

  // storage is anything with getItem/setItem, or null for memory only.
  function create(storage, key) {
    let memory = [];
    return {
      load() {
        if (!storage) return memory.slice();
        try {
          const raw = storage.getItem(key);
          if (raw === null) return [];
          const data = JSON.parse(raw);
          // Before version 1 the stored value was the bare array.
          return sanitize(Array.isArray(data) ? data : data && data.todos);
        } catch (err) {
          return [];
        }
      },
      save(todos) {
        memory = todos.slice();
        if (!storage) return false;
        try {
          storage.setItem(key, JSON.stringify({ version: VERSION, todos }));
          return true;
        } catch (err) {
          return false;
        }
      }
    };
  }

  return { VERSION, isValidTodo, sanitize, serialize, parseImport, create };
});
