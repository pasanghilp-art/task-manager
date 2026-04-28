/* ─────────────────────────────────────────
   TASK MANAGER — Pasang Tamang
   script.js
───────────────────────────────────────── */

// ── State ──
let tasks = JSON.parse(localStorage.getItem('pt-tasks')) || [];
let selectedPriority = 'high';
let currentFilter    = 'all';
let nextId           = parseInt(localStorage.getItem('pt-nextid')) || 1;

// ── DOM refs ──
const taskInput  = document.getElementById('taskInput');
const addBtn     = document.getElementById('addBtn');
const taskList   = document.getElementById('taskList');
const clearBtn   = document.getElementById('clearBtn');
const taskCount  = document.getElementById('taskCount');

const statTotal  = document.getElementById('stat-total');
const statHigh   = document.getElementById('stat-high');
const statMed    = document.getElementById('stat-med');
const statDone   = document.getElementById('stat-done');

// ── Save to localStorage ──
function save() {
  localStorage.setItem('pt-tasks', JSON.stringify(tasks));
  localStorage.setItem('pt-nextid', nextId);
}

// ── Priority selector ──
document.querySelectorAll('.pri-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedPriority = btn.dataset.priority;
    document.querySelectorAll('.pri-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ── Filter buttons ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// ── Add task ──
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.style.borderColor = '#ff6b6b';
    setTimeout(() => taskInput.style.borderColor = '', 800);
    return;
  }

  tasks.unshift({
    id:       nextId++,
    text:     text,
    priority: selectedPriority,
    done:     false,
    created:  Date.now(),
  });

  taskInput.value = '';
  taskInput.focus();

  // Reset filter to show all so user sees new task
  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });

  save();
  render();
}

addBtn.addEventListener('click', addTask);

// Enter key to add
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── Toggle done ──
function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

// ── Delete task ──
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

// ── Clear completed ──
clearBtn.addEventListener('click', () => {
  const doneCount = tasks.filter(t => t.done).length;
  if (doneCount === 0) return;
  if (confirm(`Clear ${doneCount} completed task${doneCount > 1 ? 's' : ''}?`)) {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
  }
});

// ── Render ──
function render() {
  // Update stats
  const total    = tasks.length;
  const highLeft = tasks.filter(t => t.priority === 'high' && !t.done).length;
  const medLeft  = tasks.filter(t => t.priority === 'med'  && !t.done).length;
  const doneNum  = tasks.filter(t => t.done).length;

  statTotal.textContent = total;
  statHigh.textContent  = highLeft;
  statMed.textContent   = medLeft;
  statDone.textContent  = doneNum;

  // Task count label
  const remaining = tasks.filter(t => !t.done).length;
  taskCount.textContent = remaining === 0
    ? '🎉 All done!'
    : `${remaining} task${remaining > 1 ? 's' : ''} remaining`;

  // Filter tasks
  let visible = tasks;
  if (currentFilter === 'done') {
    visible = tasks.filter(t => t.done);
  } else if (currentFilter !== 'all') {
    visible = tasks.filter(t => t.priority === currentFilter && !t.done);
  }

  // Empty state
  if (visible.length === 0) {
    const messages = {
      all:  { icon: '🎯', msg: 'No tasks yet — add one above!' },
      high: { icon: '🔴', msg: 'No high priority tasks!' },
      med:  { icon: '🟡', msg: 'No medium priority tasks!' },
      low:  { icon: '🟢', msg: 'No low priority tasks!' },
      done: { icon: '🎉', msg: 'No completed tasks yet!' },
    };
    const { icon, msg } = messages[currentFilter] || messages.all;
    taskList.innerHTML = `
      <div class="empty">
        <span class="empty-icon">${icon}</span>
        <p>${msg}</p>
      </div>`;
    return;
  }

  // Render tasks
  const priLabels = { high: '🔴 High', med: '🟡 Med', low: '🟢 Low' };

  taskList.innerHTML = visible.map(t => `
    <div class="task-item ${t.priority} ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="check-btn" onclick="toggleDone(${t.id})" title="${t.done ? 'Mark undone' : 'Mark done'}">
        ${t.done ? '✓' : ''}
      </button>
      <span class="task-text">${escapeHtml(t.text)}</span>
      <span class="pri-badge">${priLabels[t.priority]}</span>
      <button class="del-btn" onclick="deleteTask(${t.id})" title="Delete task">✕</button>
    </div>
  `).join('');
}

// ── Escape HTML (security) ──
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ──
render();
