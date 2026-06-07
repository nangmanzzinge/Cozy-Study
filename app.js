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
    { id: 'plant', name: 'Plant', emoji: '🪴', price: 5 },
    { id: 'lamp', name: 'Lamp', emoji: '🕯️', price: 8 },
    { id: 'rug', name: 'Rug', emoji: '🟫', price: 10 },
    { id: 'books', name: 'Books', emoji: '📚', price: 7 },
    { id: 'desk', name: 'Desk', emoji: '🪑', price: 12 },
    { id: 'paint', name: 'Painting', emoji: '🖼️', price: 6 }
];

const PLANT_STAGES = [
    { stage: 1, emoji: '🌱', name: 'Sprout', waterCost: 2 },
    { stage: 2, emoji: '🌿', name: 'Growing', waterCost: 2 },
    { stage: 3, emoji: '🌾', name: 'Flourishing', waterCost: 2 },
    { stage: 4, emoji: '🌳', name: 'Mature', waterCost: 2 }
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
    timerRunning: false,
    activeStudySession: null
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
            items: [],
            plants: []
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
                <h2 class="room-title">Your Pet's Room 🌞</h2>
                <div class="pet-room">
                    <div class="pet-display-container">
                        <div class="pet-display" id="petDisplay">${PETS[gameState.currentPet].emoji}</div>
                        <p class="pet-status" id="petStatus">Happy and cozy! 💭</p>
                    </div>
                    <div class="room-items" id="roomItems"></div>
                </div>
            </div>
            
            <div class="sidebar">
                <div class="sidebar-section">
                    <h3 class="sidebar-title">📚 Study Sessions</h3>
                    <div class="study-section" id="studySection"></div>
                </div>
                
                <div class="sidebar-section">
                    <h3 class="sidebar-title">🌱 Plants</h3>
                    <div class="plants-section" id="plantsSection"></div>
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
        <div class="modal" id="warningModal"></div>
    `;
    
    app.appendChild(screen);
    renderStudyOptions();
    renderPlants();
    renderShop();
    renderRoomItems();
    
    // Add window unload listener for active sessions
    window.addEventListener('beforeunload', handlePageExit);
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
    // Set active session
    gameState.activeStudySession = {
        duration: duration.minutes,
        timeStarted: Date.now(),
        isActive: true,
        started: false
    };
    
    const modal = document.getElementById('studyModal');
    modal.classList.add('active');
    
    let timeLeft = duration.minutes * 60;
    let timerInterval = null;
    let isPaused = false;
    
    modal.innerHTML = `
        <div class="modal-content timer-modal-content">
            <h2 class="modal-title">📖 Study Session</h2>
            <div class="timer-display" id="timerDisplay">${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}</div>
            <div class="timer-controls">
                <button class="timer-button timer-button-start" id="startBtn" onclick="window.startTimerFunc()">Start</button>
                <button class="timer-button timer-button-pause" id="pauseBtn" onclick="window.pauseTimerFunc()" disabled>Pause</button>
            </div>
            <button class="timer-button timer-button-cancel" id="cancelBtn" onclick="window.cancelStudySessionFunc()">Cancel Session</button>
            <p class="timer-message" id="timerMessage">Ready to study? Click Start!</p>
        </div>
    `;
    
    window.startTimerFunc = () => {
        if (timerInterval) return;
        
        gameState.activeStudySession.started = true;
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
    
    window.pauseTimerFunc = () => {
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
    
    window.cancelStudySessionFunc = () => {
        if (timerInterval) clearInterval(timerInterval);
        
        if (gameState.activeStudySession.started) {
            showWarningModal('⚠️ Session Cancelled', 'You cancelled the study session before completion. No cookies earned. Keep practicing! 💪', () => {
                gameState.activeStudySession = null;
                saveGame();
                closeModals();
            });
        } else {
            gameState.activeStudySession = null;
            saveGame();
            closeModals();
        }
    };
}

function updateTimerDisplay(seconds, duration) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('timerMessage').textContent = `Keep up the great work! 📚`;
}

function completeStudySession(cookiesEarned) {
    gameState.activeStudySession = null;
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

function handlePageExit(event) {
    if (gameState.activeStudySession && gameState.activeStudySession.isActive && gameState.activeStudySession.started) {
        event.preventDefault();
        event.returnValue = '⚠️ You have an active study session! Leaving will cancel it and you won\'t receive any cookies.';
        return event.returnValue;
    }
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
    document.getElementById('warningModal').classList.remove('active');
    renderMainScreen();
}

// ===== PLANTS SYSTEM =====
function renderPlants() {
    const section = document.getElementById('plantsSection');
    section.innerHTML = '';
    const petData = getPetData();
    
    if (!petData.plants) {
        petData.plants = [];
    }
    
    if (petData.plants.length === 0) {
        section.innerHTML = '<div class="no-plants">No plants yet! Buy one from the shop.</div>';
        return;
    }
    
    petData.plants.forEach((plant, index) => {
        const plantStage = PLANT_STAGES[plant.stage - 1];
        const plantDiv = document.createElement('div');
        plantDiv.className = 'plant-item';
        plantDiv.innerHTML = `
            <div class="plant-display">${plantStage.emoji}</div>
            <div class="plant-info">
                <span class="plant-name">${plantStage.name}</span>
                <button class="plant-water-btn" onclick="waterPlant(${index})">Water (${plantStage.waterCost} 🍪)</button>
            </div>
        `;
        section.appendChild(plantDiv);
    });
}

function waterPlant(plantIndex) {
    const petData = getPetData();
    const plant = petData.plants[plantIndex];
    const plantStage = PLANT_STAGES[plant.stage - 1];
    
    if (petData.cookies < plantStage.waterCost) {
        alert(`You need ${plantStage.waterCost - petData.cookies} more cookies!`);
        return;
    }
    
    petData.cookies -= plantStage.waterCost;
    
    // Grow plant
    if (plant.stage < PLANT_STAGES.length) {
        plant.stage++;
        plant.lastWatered = Date.now();
    }
    
    saveGame();
    renderPlants();
    renderRoomItems();
    
    // Update cookie display
    document.getElementById('totalCookies').textContent = petData.cookies;
    document.getElementById('cookieCount').textContent = petData.cookies;
}

function addPlantToRoom() {
    const petData = getPetData();
    if (!petData.plants) {
        petData.plants = [];
    }
    
    petData.plants.push({
        stage: 1,
        lastWatered: Date.now()
    });
    
    saveGame();
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
        
        // Special handling for plant item
        let displayPrice = `${item.price} 🍪`;
        if (item.id === 'plant' && !isOwned) {
            displayPrice = `${item.price} 🍪 to Plant`;
        }
        
        shopItem.innerHTML = `
            <div class="shop-item-emoji">${item.emoji}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">
                ${isOwned && item.id !== 'plant' ? '✓ Owned' : displayPrice}
            </div>
        `;
        
        if (isOwned && item.id !== 'plant') {
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
        
        // Special handling for plants
        if (item.id === 'plant') {
            addPlantToRoom();
        } else {
            // For furniture, don't add if already purchased
            if (!petData.items.includes(item.id)) {
                petData.items.push(item.id);
            }
        }
        
        saveGame();
        showItemBought(item);
    } else {
        alert(`You need ${item.price - petData.cookies} more cookies!`);
    }
}

function showItemBought(item) {
    const modal = document.getElementById('studyModal');
    modal.classList.add('active');
    
    let message = `You bought <strong>${item.name}</strong>! Your pet loves it!`;
    if (item.id === 'plant') {
        message = `You planted a new <strong>${item.name}</strong>! Water it to watch it grow!`;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">🎁 Purchased!</h2>
            <p class="modal-body">${item.emoji}</p>
            <p class="modal-body">${message}</p>
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
    
    // Render furniture items
    if (petData.items && petData.items.length > 0) {
        petData.items.forEach((itemId, index) => {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (item) {
                const roomItem = document.createElement('div');
                roomItem.className = 'room-item furniture-item';
                roomItem.textContent = item.emoji;
                roomItem.style.animationDelay = `${index * 0.1}s`;
                container.appendChild(roomItem);
            }
        });
    }
    
    // Render plants
    if (petData.plants && petData.plants.length > 0) {
        petData.plants.forEach((plant, index) => {
            const plantStage = PLANT_STAGES[plant.stage - 1];
            const plantItem = document.createElement('div');
            plantItem.className = 'room-item plant-room-item';
            plantItem.textContent = plantStage.emoji;
            plantItem.title = `Plant Stage: ${plantStage.name}`;
            plantItem.style.animationDelay = `${(petData.items.length + index) * 0.1}s`;
            container.appendChild(plantItem);
        });
    }
}

// ===== WARNING MODAL =====
function showWarningModal(title, message, callback) {
    const modal = document.getElementById('warningModal');
    modal.classList.add('active');
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">${title}</h2>
            <p class="modal-body">${message}</p>
            <div class="modal-buttons">
                <button class="button button-primary" onclick="window.handleWarningConfirmFunc()">OK</button>
            </div>
        </div>
    `;
    
    window.handleWarningConfirmFunc = callback;
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
            items: [],
            plants: []
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
            items: [],
            plants: []
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
