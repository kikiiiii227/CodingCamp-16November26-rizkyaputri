/* Clock, Date & Greeting */
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const greetingTextEl = document.getElementById('greeting-text');
const editNameBtn = document.getElementById('edit-name-btn');

let userName = localStorage.getItem('dashboard_username') || 'Rizkya';

function updateClockAndGreeting() {
    const now = new Date();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);

    const currentHour = now.getHours();
    let greeting = 'Good Evening';
    if (currentHour >= 4 && currentHour < 12) {
        greeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Good Afternoon';
    }

    greetingTextEl.innerHTML = `${greeting}, <span id="user-name">${userName}</span>`;
}

editNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter your name:', userName);
    if (newName && newName.trim() !== '') {
        userName = newName.trim();
        localStorage.setItem('dashboard_username', userName);
        updateClockAndGreeting();
    }
});

setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();

/* Theme Toggle */
const themeToggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('dashboard_theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️ Light';
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dashboard_theme', isDark ? 'dark' : 'light');
    themeToggleBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
});

/* Focus Timer */
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const customMinutesInput = document.getElementById('custom-minutes');
const setTimerBtn = document.getElementById('set-timer-btn');

let defaultMinutes = parseInt(localStorage.getItem('dashboard_pomodoro')) || 25;
customMinutesInput.value = defaultMinutes;
let timeLeft = defaultMinutes * 60;
let timerInterval = null;

function updateTimerDisplay() {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

startBtn.addEventListener('click', () => {
    if (timerInterval !== null) return;
    startBtn.classList.add('is-active');
    stopBtn.classList.remove('is-paused');
    
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            startBtn.classList.remove('is-active');
            alert('Focus session complete! Time to take a short break.');
        }
    }, 1000);
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.classList.remove('is-active');
    stopBtn.classList.add('is-paused');
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.classList.remove('is-active');
    stopBtn.classList.remove('is-paused');
    timeLeft = defaultMinutes * 60;
    updateTimerDisplay();
});

setTimerBtn.addEventListener('click', () => {
    const newMinutes = parseInt(customMinutesInput.value);
    if (newMinutes >= 1 && newMinutes <= 120) {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.classList.remove('is-active');
        stopBtn.classList.remove('is-paused');
        defaultMinutes = newMinutes;
        localStorage.setItem('dashboard_pomodoro', defaultMinutes);
        timeLeft = defaultMinutes * 60;
        updateTimerDisplay();
    } else {
        alert('Please enter a duration between 1 and 120 minutes.');
    }
});

updateTimerDisplay();

/* To-Do List */
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const sortTasksSelect = document.getElementById('sort-tasks');

let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];

function saveTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    
    let displayTasks = [...tasks];
    const sortBy = sortTasksSelect.value;

    if (sortBy === 'az') {
        displayTasks.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'za') {
        displayTasks.sort((a, b) => b.text.localeCompare(a.text));
    } else if (sortBy === 'incomplete') {
        displayTasks.sort((a, b) => a.completed - b.completed);
    } else if (sortBy === 'completed') {
        displayTasks.sort((a, b) => b.completed - a.completed);
    }

    displayTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'task-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const span = document.createElement('span');
        span.className = `task-text ${task.completed ? 'completed' : ''}`;
        span.textContent = task.text;

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(span);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => {
            const editedText = prompt('Edit task:', task.text);
            if (editedText !== null && editedText.trim() !== '') {
                const isDuplicate = tasks.some(
                    t => t.id !== task.id && t.text.toLowerCase() === editedText.trim().toLowerCase()
                );
                if (isDuplicate) {
                    alert('This task already exists!');
                    return;
                }
                task.text = editedText.trim();
                saveTasks();
                renderTasks();
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(leftDiv);
        li.appendChild(actionsDiv);
        taskList.appendChild(li);
    });
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        alert('This task is already on your list!');
        return;
    }

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    taskInput.value = '';
    saveTasks();
    renderTasks();
});

sortTasksSelect.addEventListener('change', renderTasks);
renderTasks();

/* Quick Links */
const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linksContainer = document.getElementById('links-container');

let quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
    { id: 1, name: 'Google', url: 'https://www.google.com' },
    { id: 2, name: 'GitHub', url: 'https://github.com' }
];

function saveLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
}

function renderLinks() {
    linksContainer.innerHTML = '';
    quickLinks.forEach(link => {
        const pill = document.createElement('div');
        pill.className = 'link-pill';

        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.name;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-link';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Remove Link';
        removeBtn.addEventListener('click', () => {
            quickLinks = quickLinks.filter(l => l.id !== link.id);
            saveLinks();
            renderLinks();
        });

        pill.appendChild(anchor);
        pill.appendChild(removeBtn);
        linksContainer.appendChild(pill);
    });
}

linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();
    if (!name || !url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    quickLinks.push({
        id: Date.now(),
        name: name,
        url: url
    });

    linkNameInput.value = '';
    linkUrlInput.value = '';
    saveLinks();
    renderLinks();
});

renderLinks();