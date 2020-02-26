# vanilla-todo

A todo list built with no framework and no build step: just HTML, CSS and
the DOM. There are no dependencies and nothing to compile.

    npm start        # serves public/ on http://127.0.0.1:8080
    npm test         # logic tests under Node

You can also open `public/index.html` directly, though localStorage is more
reliable over http.

## Features

- add, check off, edit (double-click) and delete todos
- All / Active / Completed views, kept in the URL hash
- items-left counter, clear completed, mark all
- optional due dates with an overdue highlight
- drag to reorder (on the All view)
- undo for the last twenty deletions (Ctrl/Cmd+Z)
- export and import as JSON
- follows the system light/dark setting
- data stays in your browser's localStorage and works with it blocked

## How it is organised

- `public/js/todos.js` pure functions over arrays of `{ id, title, done, due? }`.
  The same file is used by the page (as `window.Todos`) and by the Node tests.
- `public/js/storage.js` localStorage wrapper with a versioned envelope,
  validation, and import/export parsing (`window.TodoStorage`).
- `public/js/app.js` the DOM code. The list is built with `createElement`
  and `textContent`, so titles are never interpreted as HTML.
- `scripts/serve.js` a small static server for development.
- `test/` plain `assert` tests for everything except `app.js`.
