(function () {
  'use strict';

  const KEY = 'vanilla-todo';
  const form = document.getElementById('new-form');
  const input = document.getElementById('new-title');
  const list = document.getElementById('list');
  const footer = document.getElementById('footer');
  const count = document.getElementById('count');
  const clearButton = document.getElementById('clear-completed');
  const filterLinks = document.querySelectorAll('#filters a');

  let todos = load();
  let editingId = null;

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

  function currentFilter() {
    return Todos.parseFilter(window.location.hash);
  }

  function render() {
    list.innerHTML = Todos.visible(todos, currentFilter()).map(todo => `
      <li data-id="${todo.id}" class="${todo.done ? 'done' : ''}">
        <input class="toggle" type="checkbox" ${todo.done ? 'checked' : ''}>
        ${todo.id === editingId
          ? `<input class="edit" value="${todo.title}">`
          : `<span class="title">${todo.title}</span>`}
        <button class="remove" type="button" aria-label="Delete">&times;</button>
      </li>`).join('');
    const edit = list.querySelector('.edit');
    if (edit) edit.focus();
    const left = Todos.remaining(todos);
    footer.hidden = todos.length === 0;
    count.textContent = left + (left === 1 ? ' item left' : ' items left');
    clearButton.hidden = left === todos.length;
    filterLinks.forEach(link => {
      link.classList.toggle('selected', link.dataset.filter === currentFilter());
    });
  }

  function update(next) {
    todos = next;
    save();
    render();
  }

  function idOf(el) {
    return Number(el.closest('li').dataset.id);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    update(Todos.add(todos, input.value));
    input.value = '';
  });

  list.addEventListener('change', event => {
    if (!event.target.classList.contains('toggle')) return;
    update(Todos.toggle(todos, idOf(event.target)));
  });

  list.addEventListener('click', event => {
    if (!event.target.classList.contains('remove')) return;
    update(Todos.remove(todos, idOf(event.target)));
  });

  function finishEdit(field, commit) {
    const id = editingId;
    editingId = null;
    if (commit) update(Todos.rename(todos, id, field.value));
    else render();
  }

  list.addEventListener('dblclick', event => {
    if (!event.target.classList.contains('title')) return;
    editingId = idOf(event.target);
    render();
  });

  list.addEventListener('keydown', event => {
    if (!event.target.classList.contains('edit')) return;
    if (event.key === 'Enter') finishEdit(event.target, true);
    else if (event.key === 'Escape') finishEdit(event.target, false);
  });

  list.addEventListener('focusout', event => {
    if (event.target.classList.contains('edit') && editingId !== null) {
      finishEdit(event.target, true);
    }
  });

  clearButton.addEventListener('click', () => update(Todos.clearCompleted(todos)));

  window.addEventListener('hashchange', render);
  render();
})();
