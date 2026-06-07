// ===== PET DATA =====
const PETS = {
    bunny: { name: 'Bunny', emoji: '🐰', desc: 'Soft and fluffy' },
    cat: { name: 'Cat', emoji: '🐱', desc: 'Mysterious and elegant' },
    dog: { name: 'Dog', emoji: '🐕', desc: 'Loyal and energetic' },
    hamster: { name: 'Hamster', emoji: '🐹', desc: 'Cute and curious' },
    fox: { name: 'Fox', emoji: '🦊', desc: 'Clever and playful' },
    monkey: { name: 'Monkey', emoji: '🐵', desc: 'Mischievous and fun' }
};

const SHOP_ITEMS = [
    { id: 'plant', name: 'Plant', emoji: '🌿', price: 5 },
    { id: 'lamp', name: 'Lamp', emoji: '🕯️', price: 8 },
    { id: 'rug', name: 'Rug', emoji: '🟫', price: 10 },
    { id: 'books', name: 'Books', emoji: '📚', price: 7 },
    { id: 'desk', name: 'Desk', emoji: '🪑', price: 12 },
    { id: 'paint', name: 'Painting', emoji: '🖼️', price: 6 }
];

const COOKIES = ['🍪', '🍪', '🍪', '🍪', '🍪'];
const COOKIE_TYPES = [
    { emoji: '🍪', color: 'var(--cookie-brown)' },
    { emoji: '🍪', color: 'var(--cookie-golden)' },
    { emoji: '🍪', color: 'var(--cookie-dark)' },
    { emoji: '🍪', color: 'var(--cookie-light)' },
    { emoji: '🍪', color: 'var(--cookie-pink)' }
];

const STUDY_DURATIONS = [
    { minutes: 15, cookies: 1, label: '15 min' },
    { minutes: 25, cookies: 2, label: '25 min' },
    { minutes: 45, cookies: 4, label: '45 min' },
    { minutes: 60, cookies: 5, label: '60 min' }
];

// ===== APP STATE =====
let gameState = {
    hasAdoptedPet: false,
    currentPet: null,
    petName: '',
    cookies: 0,
    studyProgress: 0,
    petLevel: 1,
    purchasedItems: [],
    allPetsData: {}, // Store data for all pets
    currentTimer: null,
    timerRunning: false
};

// ===== LOCALSTORAGE =====
function saveGame() {
    localStorage.setItem('cozyStudyGame', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('cozyStudyGame');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    loadGame();
    initializeApp();
});

function initializeApp() {
    const app = document.getElementById('app');
    
    if (!gameState.hasAdoptedPet) {
        renderAdoptionScreen();
    } else {
        renderMainScreen();
    }
}

// ===== ADOPTION SCREEN =====
function renderAdoptionScreen() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    const screen = document.createElement('div');
    screen.className = 'screen adoption-screen active';
    
    screen.innerHTML = `
        <h1 class="adoption-title">🏠 Cozy Study</h1>
        <p class="adoption-subtitle">Welcome! Let's find your study companion</p>
        <div class="pet-grid" id="petGrid"></div>
    `;
    
    app.appendChild(screen);
    renderPetCards();
}

function renderPetCards() {
    const grid = document.getElementById('petGrid');
    grid.innerHTML = '';
    
    Object.entries(PETS).forEach(([key, pet]) => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <span class="pet-emoji">${pet.emoji}</span>
            <h3 class="pet-name">${pet.name}</h3>
            <p class="pet-desc">${pet.desc}</p>
        `;
        
        card.addEventListener('click', () => adoptPet(key));
        grid.appendChild(card);
    });
}

function adoptPet(petKey) {
    const app = document.getElementById('app');
    const screen = app.querySelector('.adoption-screen');
    
    // Show naming modal
    const namingModal = document.createElement('div');
    namingModal.className = 'naming-container';
    namingModal.innerHTML = `
        <h2 class="naming-title">Name your ${PETS[petKey].name} ${PETS[petKey].emoji}</h2>
        <input type="text" class="name-input" id="petNameInput" placeholder="Enter your pet's name" maxlength="20">
        <div style="display: flex; gap: 10px;">
            <button class="button button-primary" onclick="confirmAdoption('${petKey}')">Adopt!</button>
            <button class="button button-secondary" onclick="location.reload()">Cancel</button>
        </div>
    `;
    
    screen.innerHTML = '';
    screen.appendChild(namingModal);
    
    const input = document.getElementById('petNameInput');
    input.focus();
    
    // Allow enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirmAdoption(petKey);
    });
    
    window.confirmAdoption = (petKey) => {
        const name = document.getElementById('petNameInput').value.trim();
        if (!name) {
            alert('Please enter a name!');
            return;
        }
        
        gameState.hasAdoptedPet = true;
        gameState.currentPet = petKey;
        gameState.petName = name;
        gameState.allPetsData[petKey] = {
            name: name,
            cookies: 0,
            level: 1,
            studyProgress: 0,
            items: []
        };
        
        saveGame();
        initializeApp();
    };
}

// ===== MAIN SCREEN =====
function renderMainScreen() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    const screen = document.createElement('div');
    screen.className = 'screen main-screen active';
    
    screen.innerHTML = `
        <div class="header">
            <div class="header-left">
                <div class="pet-info">
                    <span class="pet-icon">${PETS[gameState.currentPet].emoji}</span>
                    <div class="pet-details">
                        <span class="pet-current-name" id="petName">${gameState.petName}</span>
                        <span class="pet-level" id="petLevel">Level ${getPetData().level}</span>
                    </div>
                </div>
                <div class="stat-display">
                    <div class="stat">
                        <span class="stat-label">Cookies:</span>
                        <span class="stat-value" id="cookieCount">${getPetData().cookies}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value" id="progressCount">${getPetData().studyProgress}</span>
                    </div>
                </div>
            </div>
            <div class="header-right">
                <button class="header-button" onclick="openSwitchPetModal()">Switch Pet</button>
                <button class="header-button" onclick="resetGame()">Reset Game</button>
            </div>
        </div>
        
        <div class="content-area">
            <div class="room-section">
                <h2 class="room-title">Your Pet's Room</h2>
                <div class="pet-room">
                    <span class="pet-display" id="petDisplay">${PETS[gameState.currentPet].emoji}</span>
                    <p class="pet-status" id="petStatus">Happy and relaxed! 💭</p>
                    <div class="room-items" id="roomItems"></div>
                </div>
            </div>
            
            <div class="sidebar">
                <div class="sidebar-section">
                    <h3 class="sidebar-title">📚 Study Sessions</h3>
                    <div class="study-section" id="studySection"></div>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">🍪 Cookies</h3>
                    <div class="cookies-display">
                        <div class="cookie-count">
                            <span>Total Earned:</span>
                            <span class="cookie-count-value" id="totalCookies">${getPetData().cookies}</span>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">🛍️ Shop</h3>
                    <div class="shop-grid" id="shopGrid"></div>
                </div>
            </div>
        </div>
        
        <div class="modal" id="studyModal"></div>
        <div class="modal" id="switchPetModal"></div>
    `;
    
    app.appendChild(screen);
    renderStudyOptions();
    renderShop();
    renderRoomItems();
}

// ===== STUDY SESSIONS =====
function renderStudyOptions() {
    const section = document.getElementById('studySection');
    section.innerHTML = '';
    
    STUDY_DURATIONS.forEach(duration => {
        const button = document.createElement('div');
        button.className = 'study-option';
        button.innerHTML = `
            <span class="study-option-label">${duration.label}</span>
            <span class="study-option-reward">Earn ${duration.cookies} ${duration.cookies === 1 ? '🍪' : '🍪'.repeat(duration.cookies)}</span>
        `;
        
        button.addEventListener('click', () => startStudySession(duration));
        section.appendChild(button);
    });
}

function startStudySession(duration) {
    const modal = document.getElementById('studyModal');
    modal.classList.add('active');
    
    let timeLeft = duration.minutes * 60;
    let timerInterval;
    let isPaused = false;
    
    modal.innerHTML = `
        <div class="modal-content timer-modal-content">
            <h2 class="modal-title">📖 Study Session</h2>
            <div class="timer-display" id="timerDisplay">00:00</div>
            <div class="timer-controls">
                <button class="timer-button timer-button-start" id="startBtn" onclick="startTimer()">Start</button>
                <button class="timer-button timer-button-pause" id="pauseBtn" onclick="pauseTimer()" disabled>Pause</button>
            </div>
            <p class="timer-message" id="timerMessage">Ready to study? Click Start!</p>
        </div>
    `;
    
    window.startTimer = () => {
        if (timerInterval) return;
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        isPaused = false;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft, duration);
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                completeStudySession(duration.cookies);
            }
        }, 1000);
    };
    
    window.pauseTimer = () => {
        if (!timerInterval) return;
        
        clearInterval(timerInterval);
        timerInterval = null;
        
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        isPaused = true;
        
        document.getElementById('timerMessage').textContent = 'Paused. Click Start to continue!';
    };
    
    updateTimerDisplay(timeLeft, duration);
}

function updateTimerDisplay(seconds, duration) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('timerMessage').textContent = `Keep up the great work! 📚`;
}

function completeStudySession(cookiesEarned) {
    const petData = getPetData();
    petData.cookies += cookiesEarned;
    petData.studyProgress += cookiesEarned;
    petData.level = Math.floor(petData.studyProgress / 20) + 1;
    
    saveGame();
    
    const modal = document.getElementById('studyModal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">🎉 Session Complete!</h2>
            <p class="modal-body">You earned <strong>${cookiesEarned} ${cookiesEarned === 1 ? '🍪' : '🍪'.repeat(cookiesEarned)}</strong>!</p>
            <p class="modal-body">Your pet is so proud of you! 💕</p>
            <div class="modal-buttons">
                <button class="button button-primary" onclick="closeModals()">Continue</button>
            </div>
        </div>
    `;
    
    // Show floating cookies
    showFloatingCookie();
}

function showFloatingCookie() {
    const cookieType = COOKIE_TYPES[Math.floor(Math.random() * COOKIE_TYPES.length)];
    const cookie = document.createElement('div');
    cookie.className = 'cookie-earned';
    cookie.textContent = cookieType.emoji;
    cookie.style.left = Math.random() * 80 + 10 + '%';
    cookie.style.top = '50%';
    document.body.appendChild(cookie);
    
    setTimeout(() => cookie.remove(), 2000);
}

function closeModals() {
    document.getElementById('studyModal').classList.remove('active');
    document.getElementById('switchPetModal').classList.remove('active');
    renderMainScreen();
}

// ===== SHOP =====
function renderShop() {
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';
    const petData = getPetData();
    
    SHOP_ITEMS.forEach(item => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        const isOwned = petData.items.includes(item.id);
        
        shopItem.innerHTML = `
            <div class="shop-item-emoji">${item.emoji}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">
                ${isOwned ? '✓ Owned' : `${item.price} 🍪`}
            </div>
        `;
        
        if (isOwned) {
            shopItem.style.opacity = '0.6';
        } else {
            shopItem.style.cursor = 'pointer';
            shopItem.addEventListener('click', () => buyItem(item));
        }
        
        grid.appendChild(shopItem);
    });
}

function buyItem(item) {
    const petData = getPetData();
    
    if (petData.cookies >= item.price) {
        petData.cookies -= item.price;
        petData.items.push(item.id);
        saveGame();
        renderMainScreen();
        showItemBought(item);
    } else {
        alert(`You need ${item.price - petData.cookies} more cookies!`);
    }
}

function showItemBought(item) {
    const modal = document.getElementById('studyModal');
    modal.classList.add('active');
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">🎁 Purchased!</h2>
            <p class="modal-body">${item.emoji}</p>
            <p class="modal-body">You bought <strong>${item.name}</strong>! Your pet loves it!</p>
            <div class="modal-buttons">
                <button class="button button-primary" onclick="closeModals()">Awesome!</button>
            </div>
        </div>
    `;
}

// ===== ROOM ITEMS =====
function renderRoomItems() {
    const container = document.getElementById('roomItems');
    container.innerHTML = '';
    const petData = getPetData();
    
    petData.items.forEach(itemId => {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item) {
            const roomItem = document.createElement('div');
            roomItem.className = 'room-item';
            roomItem.textContent = item.emoji;
            container.appendChild(roomItem);
        }
    });
}

// ===== PET SWITCHING =====
function openSwitchPetModal() {
    const modal = document.getElementById('switchPetModal');
    modal.classList.add('active');
    
    let html = `
        <div class="modal-content">
            <h2 class="modal-title">Switch Pet</h2>
            <div class="pet-selector-grid" id="petSelectorGrid"></div>
            <div class="modal-buttons">
                <button class="button button-secondary" onclick="closeModals()">Cancel</button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    
    const grid = document.getElementById('petSelectorGrid');
    Object.entries(PETS).forEach(([key, pet]) => {
        const item = document.createElement('div');
        item.className = 'pet-selector-item';
        if (key === gameState.currentPet) item.classList.add('selected');
        
        item.innerHTML = `
            <div class="pet-selector-emoji">${pet.emoji}</div>
            <div class="pet-selector-name">${pet.name}</div>
        `;
        
        item.addEventListener('click', () => switchPet(key));
        grid.appendChild(item);
    });
}

function switchPet(petKey) {
    gameState.currentPet = petKey;
    if (!gameState.allPetsData[petKey]) {
        gameState.allPetsData[petKey] = {
            name: PETS[petKey].name,
            cookies: 0,
            level: 1,
            studyProgress: 0,
            items: []
        };
    }
    saveGame();
    closeModals();
}

// ===== UTILITIES =====
function getPetData() {
    if (!gameState.allPetsData[gameState.currentPet]) {
        gameState.allPetsData[gameState.currentPet] = {
            name: gameState.petName,
            cookies: 0,
            level: 1,
            studyProgress: 0,
            items: []
        };
    }
    return gameState.allPetsData[gameState.currentPet];
}

function resetGame() {
    if (confirm('Are you sure you want to reset your entire game? This cannot be undone!')) {
        localStorage.removeItem('cozyStudyGame');
        location.reload();
    }
}
