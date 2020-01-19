(function () {
  'use strict';

  const KEY = 'vanilla-todo';
  const form = document.getElementById('new-form');
  const input = document.getElementById('new-title');
  const list = document.getElementById('list');
  const footer = document.getElementById('footer');
  const count = document.getElementById('count');
  const clearButton = document.getElementById('clear-completed');
  const toggleAll = document.getElementById('toggle-all');
  const filterLinks = document.querySelectorAll('#filters a');

  const store = TodoStorage.create(getStorage(), KEY);
  let todos = store.load();
  let editingId = null;

  // Merely reading window.localStorage can throw when site data is blocked.
  function getStorage() {
    try {
      return window.localStorage;
    } catch (err) {
      return null;
    }
  }

  function save() {
    store.save(todos);
  }

  function currentFilter() {
    return Todos.parseFilter(window.location.hash);
  }

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function renderItem(todo) {
    const li = element('li', todo.done ? 'done' : '');
    li.dataset.id = todo.id;

    const toggle = element('input', 'toggle');
    toggle.type = 'checkbox';
    toggle.checked = todo.done;
    toggle.setAttribute('aria-label', 'Mark "' + todo.title + '" as done');
    li.appendChild(toggle);

    if (todo.id === editingId) {
      const edit = element('input', 'edit');
      edit.value = todo.title;
      li.appendChild(edit);
    } else {
      li.appendChild(element('span', 'title', todo.title));
    }

    const remove = element('button', 'remove', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Delete "' + todo.title + '"');
    li.appendChild(remove);
    return li;
  }

  function render() {
    list.textContent = '';
    Todos.visible(todos, currentFilter()).forEach(todo => {
      list.appendChild(renderItem(todo));
    });
    const edit = list.querySelector('.edit');
    if (edit) edit.focus();

    const left = Todos.remaining(todos);
    footer.hidden = todos.length === 0;
    count.textContent = left + (left === 1 ? ' item left' : ' items left');
    clearButton.hidden = left === todos.length;
    toggleAll.hidden = todos.length === 0;
    toggleAll.checked = todos.length > 0 && left === 0;
    filterLinks.forEach(link => {
      const selected = link.dataset.filter === currentFilter();
      link.classList.toggle('selected', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
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

  function finishEdit(field, commit) {
    const id = editingId;
    editingId = null;
    if (commit) update(Todos.rename(todos, id, field.value));
    else render();
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
    input.focus();
  });

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
  toggleAll.addEventListener('change', () => update(Todos.toggleAll(todos)));

  window.addEventListener('hashchange', render);
  render();
})();
