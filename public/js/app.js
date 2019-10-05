(function () {
  'use strict';

  const form = document.getElementById('new-form');
  const input = document.getElementById('new-title');
  const list = document.getElementById('list');
  const todos = [];

  function render() {
    list.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.textContent = todo.title;
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    todos.push({ id: todos.length + 1, title: input.value, done: false });
    input.value = '';
    render();
  });

  render();
})();
