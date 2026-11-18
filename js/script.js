// ==========================================
// 1. FITUR SAPAAN, JAM, TANGGAL & CUSTOM NAME
// ==========================================
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');
const greetingTextEl = document.getElementById('greeting-text');
const editNameBtn = document.getElementById('edit-name-btn');

// Ambil nama dari Local Storage, jika belum ada gunakan 'Rizkya'
let userName = localStorage.getItem('dashboard_userName') || 'Rizkya';

function updateClockAndGreeting() {
    const now = new Date();
    
    // Format Jam (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Format Tanggal
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', dateOptions);

    // Tentukan Sapaan Berdasarkan Jam
    const currentHour = now.getHours();
    let greeting = 'Good Evening';
    if (currentHour >= 5 && currentHour < 12) {
        greeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 18) {
        greeting = 'Good Afternoon';
    }

    greetingTextEl.innerHTML = `${greeting}, <span id="user-name">${userName}</span>`;
}

// Tantangan: Custom Name in Greeting
editNameBtn.addEventListener('click', () => {
    const newName = prompt('Masukkan nama panggilan Anda:', userName);
    if (newName !== null && newName.trim() !== '') {
        userName = newName.trim();
        localStorage.setItem('dashboard_userName', userName);
        updateClockAndGreeting();
    }
});

// Jalankan jam setiap 1 detik (1000 ms)
setInterval(updateClockAndGreeting, 1000);
updateClockAndGreeting();


// ==========================================
// 2. TANTANGAN: LIGHT / DARK MODE
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('dashboard_theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️ Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('dashboard_theme', isDark ? 'dark' : 'light');
});


// ==========================================
// 3. FOCUS TIMER & UBAH DURASI POMODORO
// ==========================================
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const customMinutesInput = document.getElementById('custom-minutes');
const setTimerBtn = document.getElementById('set-timer-btn');

let defaultMinutes = parseInt(localStorage.getItem('dashboard_pomodoro')) || 25;
let timeLeft = defaultMinutes * 60;
let timerInterval = null;

customMinutesInput.value = defaultMinutes;

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

startBtn.addEventListener('click', () => {
    if (timerInterval !== null) return; // Mencegah timer ganda jika diklik berkali-kali
    
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('Waktu fokus selesai! Saatnya istirahat sejenak.');
        }
    }, 1000);
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = defaultMinutes * 60;
    updateTimerDisplay();
});

// Tantangan: Change Pomodoro Time
setTimerBtn.addEventListener('click', () => {
    const newMinutes = parseInt(customMinutesInput.value);
    if (newMinutes >= 1 && newMinutes <= 120) {
        clearInterval(timerInterval);
        timerInterval = null;
        defaultMinutes = newMinutes;
        localStorage.setItem('dashboard_pomodoro', defaultMinutes);
        timeLeft = defaultMinutes * 60;
        updateTimerDisplay();
    } else {
        alert('Masukkan durasi antara 1 hingga 120 menit.');
    }
});

updateTimerDisplay();


// ==========================================
// 4. TO-DO LIST, ANTI DUPLIKAT & SORTIR TUGAS
// ==========================================
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const sortSelect = document.getElementById('sort-tasks');

let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];

function saveTasks() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';

    // Salin array agar urutan asli tetap terjaga saat memilih 'default'
    let displayedTasks = [...tasks];
    const sortBy = sortSelect.value;

    // Tantangan: Sort Tasks
    if (sortBy === 'az') {
        displayedTasks.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'za') {
        displayedTasks.sort((a, b) => b.text.localeCompare(a.text));
    } else if (sortBy === 'incomplete') {
        displayedTasks.sort((a, b) => Number(a.completed) - Number(b.completed));
    } else if (sortBy === 'completed') {
        displayedTasks.sort((a, b) => Number(b.completed) - Number(a.completed));
    }

    displayedTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item';

        li.innerHTML = `
            <div class="task-left">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    // Tantangan: Prevent Duplicate Tasks (tidak peduli huruf besar/kecil)
    const isDuplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
        alert('Tugas dengan nama tersebut sudah ada di dalam daftar!');
        return;
    }

    tasks.unshift({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskInput.value = '';
});

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Ubah nama tugas:', task.text);
    if (newText !== null && newText.trim() !== '') {
        const trimmed = newText.trim();
        // Cek duplikat saat mengedit
        const isDuplicate = tasks.some(t => t.id !== id && t.text.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            alert('Nama tugas tersebut sudah digunakan!');
            return;
        }
        task.text = trimmed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

sortSelect.addEventListener('change', renderTasks);
renderTasks();


// ==========================================
// 5. QUICK LINKS (TAUTAN CEPAT)
// ==========================================
const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linksContainer = document.getElementById('links-container');

// Tautan bawaan awal jika Local Storage masih kosong
let quickLinks = JSON.parse(localStorage.getItem('dashboard_links')) || [
    { id: 1, name: 'Google', url: 'https://www.google.com' },
    { id: 2, name: 'GitHub', url: 'https://github.com' }
];

function saveLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(quickLinks));
}

function renderLinks() {
    linksContainer.innerHTML = '';
    quickLinks.forEach((link) => {
        const div = document.createElement('div');
        div.className = 'link-pill';
        div.innerHTML = `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
            <button class="remove-link" onclick="deleteLink(${link.id})" title="Hapus Link">✕</button>
        `;
        linksContainer.appendChild(div);
    });
}

linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (!name || !url) return;

    quickLinks.push({
        id: Date.now(),
        name: name,
        url: url
    });

    saveLinks();
    renderLinks();
    linkNameInput.value = '';
    linkUrlInput.value = '';
});

function deleteLink(id) {
    quickLinks = quickLinks.filter(l => l.id !== id);
    saveLinks();
    renderLinks();
}

renderLinks();