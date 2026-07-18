// ========================
// TIMEZONE DATA
// ========================
const TIMEZONES = {
    'Americas': {
        'New York': 'America/New_York',
        'Los Angeles': 'America/Los_Angeles',
        'Chicago': 'America/Chicago',
        'Denver': 'America/Denver',
        'Toronto': 'America/Toronto',
        'Mexico City': 'America/Mexico_City',
        'São Paulo': 'America/Sao_Paulo',
        'Buenos Aires': 'America/Argentina/Buenos_Aires'
    },
    'Europe': {
        'London': 'Europe/London',
        'Paris': 'Europe/Paris',
        'Berlin': 'Europe/Berlin',
        'Moscow': 'Europe/Moscow',
        'Istanbul': 'Europe/Istanbul',
        'Dubai': 'Asia/Dubai',
        'Amsterdam': 'Europe/Amsterdam',
        'Madrid': 'Europe/Madrid'
    },
    'Asia': {
        'Tokyo': 'Asia/Tokyo',
        'Hong Kong': 'Asia/Hong_Kong',
        'Singapore': 'Asia/Singapore',
        'Shanghai': 'Asia/Shanghai',
        'Bangkok': 'Asia/Bangkok',
        'Mumbai': 'Asia/Kolkata',
        'Bangkok': 'Asia/Bangkok',
        'Seoul': 'Asia/Seoul'
    },
    'Oceania': {
        'Sydney': 'Australia/Sydney',
        'Melbourne': 'Australia/Melbourne',
        'Auckland': 'Pacific/Auckland',
        'Fiji': 'Pacific/Fiji',
        'Honolulu': 'Pacific/Honolulu'
    }
};

// Popular timezones for quick selection
const POPULAR_TIMEZONES = [
    { city: 'New York', tz: 'America/New_York' },
    { city: 'London', tz: 'Europe/London' },
    { city: 'Tokyo', tz: 'Asia/Tokyo' },
    { city: 'Sydney', tz: 'Australia/Sydney' },
    { city: 'Paris', tz: 'Europe/Paris' },
    { city: 'Dubai', tz: 'Asia/Dubai' },
    { city: 'Mumbai', tz: 'Asia/Kolkata' },
    { city: 'Hong Kong', tz: 'Asia/Hong_Kong' }
];

// ========================
// CLOCK MANAGEMENT
// ========================
class Clock {
    constructor(city, timezone) {
        this.city = city;
        this.timezone = timezone;
        this.id = Date.now();
    }

    getTime() {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: this.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        return formatter.format(new Date());
    }

    getDate() {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: this.timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return formatter.format(new Date());
    }

    getOffset() {
        const now = new Date();
        const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzTime = new Date(now.toLocaleString('en-US', { timeZone: this.timezone }));
        const offset = (tzTime - utcTime) / (1000 * 60 * 60);
        const sign = offset >= 0 ? '+' : '';
        return `UTC ${sign}${offset}`;
    }
}

// ========================
// STATE MANAGEMENT
// ========================
let clocks = [];

// Load clocks from localStorage
function loadClocks() {
    const savedClocks = localStorage.getItem('worldClocks');
    if (savedClocks) {
        const data = JSON.parse(savedClocks);
        clocks = data.map(c => new Clock(c.city, c.timezone));
    }
}

// Save clocks to localStorage
function saveClocks() {
    const data = clocks.map(c => ({ city: c.city, timezone: c.timezone }));
    localStorage.setItem('worldClocks', JSON.stringify(data));
}

// ========================
// DOM ELEMENTS
// ========================
const clocksGrid = document.getElementById('clocksGrid');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('timezoneModal');
const addClockBtn = document.getElementById('addClockBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addBtn = document.getElementById('addBtn');
const cityInput = document.getElementById('cityInput');
const timezoneSelect = document.getElementById('timezoneSelect');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ========================
// INITIALIZATION
// ========================
function init() {
    loadClocks();
    populateTimezoneSelect();
    populatePopularTimezones();
    renderClocks();
    updateClockTimes();
    setupEventListeners();
    loadTheme();

    // Update clock times every second
    setInterval(updateClockTimes, 1000);
}

// Populate timezone select dropdown
function populateTimezoneSelect() {
    let allTimezones = [];
    
    for (const region in TIMEZONES) {
        for (const city in TIMEZONES[region]) {
            allTimezones.push({
                label: `${city} (${region})`,
                value: TIMEZONES[region][city]
            });
        }
    }

    // Sort alphabetically
    allTimezones.sort((a, b) => a.label.localeCompare(b.label));

    allTimezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.value;
        option.textContent = tz.label;
        timezoneSelect.appendChild(option);
    });
}

// Populate popular timezones
function populatePopularTimezones() {
    const container = document.getElementById('popularTimezones');
    container.innerHTML = '';

    POPULAR_TIMEZONES.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tz-button';
        btn.textContent = item.city;
        btn.onclick = (e) => {
            e.preventDefault();
            cityInput.value = item.city;
            timezoneSelect.value = item.tz;
        };
        container.appendChild(btn);
    });
}

// ========================
// RENDERING
// ========================
function renderClocks() {
    clocksGrid.innerHTML = '';

    if (clocks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    clocks.forEach(clock => {
        const card = createClockCard(clock);
        clocksGrid.appendChild(card);
    });
}

function createClockCard(clock) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.setAttribute('data-id', clock.id);

    const time = clock.getTime();
    const date = clock.getDate();
    const offset = clock.getOffset();

    card.innerHTML = `
        <div class="clock-header">
            <div class="clock-city">${clock.city}</div>
            <div class="clock-timezone">${offset}</div>
        </div>
        <div class="clock-display">
            <div class="clock-time">${time}</div>
            <div class="clock-period"></div>
            <div class="clock-date">${date}</div>
        </div>
        <div class="clock-footer">
            <button class="btn-small btn-info" onclick="showClockInfo('${clock.id}')">
                <i class="fas fa-info-circle"></i> Info
            </button>
            <button class="btn-small btn-delete" onclick="deleteClock('${clock.id}')">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;

    return card;
}

function updateClockTimes() {
    clocks.forEach(clock => {
        const card = document.querySelector(`[data-id="${clock.id}"]`);
        if (card) {
            const timeElement = card.querySelector('.clock-time');
            const dateElement = card.querySelector('.clock-date');
            const timezoneElement = card.querySelector('.clock-timezone');

            timeElement.textContent = clock.getTime();
            dateElement.textContent = clock.getDate();
            timezoneElement.textContent = clock.getOffset();
        }
    });
}

// ========================
// CLOCK OPERATIONS
// ========================
function addClock() {
    const city = cityInput.value.trim();
    const timezone = timezoneSelect.value;

    if (!city) {
        showToast('Please enter a city name', 'error');
        return;
    }

    if (!timezone) {
        showToast('Please select a timezone', 'error');
        return;
    }

    // Check for duplicates
    if (clocks.some(c => c.city.toLowerCase() === city.toLowerCase() && c.timezone === timezone)) {
        showToast('This timezone is already added!', 'warning');
        return;
    }

    const clock = new Clock(city, timezone);
    clocks.push(clock);
    saveClocks();
    renderClocks();
    
    // Reset form and close modal
    cityInput.value = '';
    timezoneSelect.value = '';
    closeModalFn();
    
    showToast(`Added ${city} to your clocks!`, 'success');
}

function deleteClock(id) {
    const clock = clocks.find(c => c.id === parseInt(id));
    if (clock) {
        clocks = clocks.filter(c => c.id !== parseInt(id));
        saveClocks();
        renderClocks();
        showToast(`Removed ${clock.city}`, 'info');
    }
}

function showClockInfo(id) {
    const clock = clocks.find(c => c.id === parseInt(id));
    if (clock) {
        const info = `
${clock.city}
━━━━━━━━━━━━━━━━━━━━
Time: ${clock.getTime()}
Date: ${clock.getDate()}
Offset: ${clock.getOffset()}
Timezone: ${clock.timezone}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(info).then(() => {
            showToast('Clock info copied to clipboard!', 'success');
        });
    }
}

// ========================
// MODAL MANAGEMENT
// ========================
function openModal() {
    modal.classList.add('active');
    cityInput.focus();
}

function closeModalFn() {
    modal.classList.remove('active');
    cityInput.value = '';
    timezoneSelect.value = '';
}

// ========================
// THEME MANAGEMENT
// ========================
function toggleTheme() {
    const isDark = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    updateThemeIcon();
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// ========================
// NOTIFICATIONS
// ========================
function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================
// EVENT LISTENERS
// ========================
function setupEventListeners() {
    addClockBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFn);
    cancelBtn.addEventListener('click', closeModalFn);
    addBtn.addEventListener('click', addClock);
    themeToggle.addEventListener('click', toggleTheme);

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFn();
        }
    });

    // Enter key to add clock
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addClock();
        }
    });

    timezoneSelect.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addClock();
        }
    });
}

// ========================
// INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', init);

// Prevent memory leaks
window.addEventListener('beforeunload', () => {
    saveClocks();
});

console.log('⏰ World Digital Clock Loaded - Track time across timezones!');
