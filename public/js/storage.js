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
      Number.isInteger(t.id) && typeof t.title === 'string' && typeof t.done === 'boolean';
  }

  function sanitize(list) {
    return Array.isArray(list) ? list.filter(isValidTodo) : [];
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

  return { VERSION, isValidTodo, sanitize, create };
});
