(function () {
  'use strict';

  const KEY = 'vanilla-todo';
  const form = document.getElementById('new-form');
  const input = document.getElementById('new-title');
  const list = document.getElementById('list');

  let todos = load();

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

  function render() {
    list.innerHTML = todos.map(todo => `
      <li data-id="${todo.id}" class="${todo.done ? 'done' : ''}">
        <input class="toggle" type="checkbox" ${todo.done ? 'checked' : ''}>
        <span class="title">${todo.title}</span>
        <button class="remove" type="button" aria-label="Delete">&times;</button>
      </li>`).join('');
  }

  function idOf(el) {
    return Number(el.closest('li').dataset.id);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    todos.push({ id: Date.now(), title: input.value, done: false });
    input.value = '';
    save();
    render();
  });

  list.addEventListener('change', event => {
    if (!event.target.classList.contains('toggle')) return;
    const id = idOf(event.target);
    todos = todos.map(t => (t.id === id ? Object.assign({}, t, { done: !t.done }) : t));
    save();
    render();
  });

  list.addEventListener('click', event => {
    if (!event.target.classList.contains('remove')) return;
    const id = idOf(event.target);
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  });

  render();
})();
