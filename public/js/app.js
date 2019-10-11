(function () {
  'use strict';

  const KEY = 'vanilla-todo';
  const form = document.getElementById('new-form');
  const input = document.getElementById('new-title');
  const list = document.getElementById('list');

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (err) {
      return [];
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(todos));
  }

  const todos = load();

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
    todos.push({ id: Date.now(), title: input.value, done: false });
    input.value = '';
    save();
    render();
  });

  render();
})();
