(function () {
  'use strict';

  const KEY = 'vanilla-todo';
  const form = document.getElementById('new-form');
  const input = document.getElementById('new-title');
  const dueInput = document.getElementById('new-due');
  const list = document.getElementById('list');
  const footer = document.getElementById('footer');
  const count = document.getElementById('count');
  const clearButton = document.getElementById('clear-completed');
  const undoButton = document.getElementById('undo');
  const toggleAll = document.getElementById('toggle-all');
  const exportButton = document.getElementById('export');
  const importInput = document.getElementById('import');
  const filterLinks = document.querySelectorAll('#filters a');

  const store = TodoStorage.create(getStorage(), KEY);
  let todos = store.load();
  let editingId = null;
  const removed = [];

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
    li.draggable = currentFilter() === 'all' && todo.id !== editingId;

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

    if (todo.due) {
      const overdue = Todos.isOverdue(todo, Todos.formatDate(new Date()));
      const due = element('time', overdue ? 'due overdue' : 'due', todo.due);
      due.dateTime = todo.due;
      li.appendChild(due);
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
    undoButton.hidden = removed.length === 0;
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
    update(Todos.add(todos, input.value, dueInput.value));
    input.value = '';
    dueInput.value = '';
  });

  list.addEventListener('change', event => {
    if (!event.target.classList.contains('toggle')) return;
    update(Todos.toggle(todos, idOf(event.target)));
  });

  list.addEventListener('click', event => {
    if (!event.target.classList.contains('remove')) return;
    const id = idOf(event.target);
    const index = todos.findIndex(t => t.id === id);
    removed.push({ todo: todos[index], index });
    if (removed.length > 20) removed.shift();
    update(Todos.remove(todos, id));
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

  let dragId = null;

  list.addEventListener('dragstart', event => {
    dragId = idOf(event.target);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(dragId)); // Firefox needs data
    event.target.classList.add('dragging');
  });

  list.addEventListener('dragover', event => {
    if (dragId === null) return;
    event.preventDefault();
    list.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    const over = event.target.closest('li');
    if (over) over.classList.add('drop-target');
  });

  list.addEventListener('drop', event => {
    if (dragId === null) return;
    event.preventDefault();
    const over = event.target.closest('li');
    const toIndex = over ? todos.findIndex(t => t.id === Number(over.dataset.id)) : todos.length;
    const id = dragId;
    dragId = null;
    update(Todos.move(todos, id, toIndex));
  });

  list.addEventListener('dragend', () => {
    dragId = null;
    render();
  });

  function undo() {
    const last = removed.pop();
    if (last) update(Todos.restore(todos, last.todo, last.index));
  }

  clearButton.addEventListener('click', () => update(Todos.clearCompleted(todos)));
  undoButton.addEventListener('click', undo);
  document.addEventListener('keydown', event => {
    const typing = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA';
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !typing) {
      event.preventDefault();
      undo();
    }
  });
  toggleAll.addEventListener('change', () => update(Todos.toggleAll(todos)));

  exportButton.addEventListener('click', () => {
    const blob = new Blob([TodoStorage.serialize(todos)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'todos.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  importInput.addEventListener('change', () => {
    const file = importInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        update(TodoStorage.parseImport(String(reader.result)));
      } catch (err) {
        window.alert(err.message);
      }
      importInput.value = '';
    };
    reader.readAsText(file);
  });

  window.addEventListener('hashchange', render);
  render();
})();
