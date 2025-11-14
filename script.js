// Game state
let currentStreak = 0;
let bestStreak = 0;
let strikes = 0;
let currentAnswer = 0;
let isAnswering = false;
let gameMode = null; // 'normal' or 'pairs'

// DOM elements (initialized in init())
let equationEl;
let currentStreakEl;
let bestStreakEl;
let livesEl;
let feedbackEl;
let answerButtons;
let gameOverModal;
let finalStreakEl;
let restartBtn;
let modalMessage;
let menuScreen;
let gameArea;
let gameHeader;
let modeIndicator;
let backToMenuBtn;
let modeButtons;

// Encouraging messages in Swedish
const encouragingMessages = [
    "Bra jobbat! Fortsätt så här! 🌟",
    "Du är jätteduktig! Kör hårt! 💪",
    "Fantastiskt! Du lär dig så fort! 🎈",
    "Toppen! Du kommer bli matteproffs! 🚀",
    "Underbart! Fortsätt öva! 🌈"
];

// Initialize game
function init() {
    // Initialize DOM elements
    equationEl = document.getElementById('equation');
    currentStreakEl = document.getElementById('currentStreak');
    bestStreakEl = document.getElementById('bestStreak');
    livesEl = document.getElementById('lives');
    feedbackEl = document.getElementById('feedback');
    answerButtons = document.querySelectorAll('.answer-btn');
    gameOverModal = document.getElementById('gameOverModal');
    finalStreakEl = document.getElementById('finalStreak');
    restartBtn = document.getElementById('restartBtn');
    modalMessage = document.getElementById('modalMessage');
    menuScreen = document.getElementById('menuScreen');
    gameArea = document.getElementById('gameArea');
    gameHeader = document.getElementById('gameHeader');
    modeIndicator = document.getElementById('modeIndicator');
    backToMenuBtn = document.getElementById('backToMenuBtn');
    modeButtons = document.querySelectorAll('.mode-btn');

    // Show menu screen initially
    showMenu();

    // Add event listeners
    answerButtons.forEach(btn => {
        btn.addEventListener('click', handleAnswer);
    });

    modeButtons.forEach(btn => {
        btn.addEventListener('click', handleModeSelection);
    });

    restartBtn.addEventListener('click', restartGame);
    backToMenuBtn.addEventListener('click', handleBackToMenu);
}

// Load best streak from localStorage (mode-specific)
function loadBestStreak() {
    if (!gameMode) return;
    const key = `bestStreak_${gameMode}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        bestStreak = parseInt(saved);
    } else {
        bestStreak = 0;
    }
}

// Save best streak to localStorage (mode-specific)
function saveBestStreak() {
    if (!gameMode) return;
    const key = `bestStreak_${gameMode}`;
    localStorage.setItem(key, bestStreak);
}

// Show menu screen
function showMenu() {
    menuScreen.classList.remove('hidden');
    gameArea.classList.add('hidden');
    gameHeader.classList.add('hidden');
    modeIndicator.classList.add('hidden');
    gameMode = null;
}

// Hide menu and show game
function showGame() {
    menuScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameHeader.classList.remove('hidden');
    modeIndicator.classList.remove('hidden');
    updateModeIndicator();
}

// Update mode indicator
function updateModeIndicator() {
    if (gameMode === 'normal') {
        modeIndicator.textContent = '➕➖ Vanlig räkning';
        modeIndicator.className = 'mode-indicator normal-mode';
    } else if (gameMode === 'pairs') {
        modeIndicator.textContent = '🔟 10-kompisar';
        modeIndicator.className = 'mode-indicator pairs-mode';
    }
}

// Handle mode selection from menu
function handleModeSelection(e) {
    const selectedMode = e.currentTarget.dataset.mode;
    gameMode = selectedMode;

    // Reset game state
    currentStreak = 0;
    strikes = 0;

    // Load best streak for this mode
    loadBestStreak();

    // Show game and start
    showGame();
    updateDisplay();
    generateNewProblem();
}

// Handle back to menu button
function handleBackToMenu() {
    if (isAnswering) return;

    // Ask for confirmation if game is in progress
    if (currentStreak > 0 || strikes > 0) {
        if (!confirm('Är du säker på att du vill avsluta? Din nuvarande rad kommer att förloras.')) {
            return;
        }
    }

    showMenu();
}

// Generate a random number within range
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate new math problem
function generateNewProblem() {
    if (gameMode === 'pairs') {
        generatePairsProblem();
    } else if (gameMode === 'normal') {
        generateNormalProblem();
    }

    // Clear feedback
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';

    // Re-enable buttons
    isAnswering = false;
    answerButtons.forEach(btn => {
        btn.disabled = false;
        btn.className = 'answer-btn';
    });
}

// Generate normal addition/subtraction problem
function generateNormalProblem() {
    const num1 = randomNumber(1, 10);
    const num2 = randomNumber(1, 10);
    const isAddition = Math.random() < 0.5;

    let equation, answer;

    if (isAddition) {
        equation = `${num1} + ${num2}`;
        answer = num1 + num2;
    } else {
        // For subtraction, ensure result is positive
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        equation = `${larger} - ${smaller}`;
        answer = larger - smaller;
    }

    currentAnswer = answer;
    equationEl.textContent = equation;

    // Generate answer options
    generateAnswerOptions(answer);
}

// Generate 10-pairs problem
function generatePairsProblem() {
    const num = randomNumber(0, 10);
    const answer = 10 - num;

    currentAnswer = answer;
    equationEl.textContent = `Vad är 10-kompis till ${num}?`;

    // Generate answer options
    generateAnswerOptions(answer);
}

// Generate 4 answer options (1 correct, 3 wrong)
function generateAnswerOptions(correctAnswer) {
    const answers = [correctAnswer];

    // Determine range based on game mode
    const maxValue = gameMode === 'pairs' ? 10 : 20;
    const minValue = gameMode === 'pairs' ? 0 : 1;

    // Generate 3 unique wrong answers
    while (answers.length < 4) {
        // Generate wrong answers within reasonable range
        let wrongAnswer;
        const offset = randomNumber(1, 5);

        if (Math.random() < 0.5) {
            wrongAnswer = correctAnswer + offset;
        } else {
            wrongAnswer = correctAnswer - offset;
        }

        // Ensure answer is within valid range and unique
        if (wrongAnswer >= minValue && wrongAnswer <= maxValue && !answers.includes(wrongAnswer)) {
            answers.push(wrongAnswer);
        }
    }

    // Shuffle answers
    shuffleArray(answers);

    // Set button values
    answerButtons.forEach((btn, index) => {
        btn.textContent = answers[index];
        btn.dataset.answer = answers[index];
    });
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Handle answer selection
function handleAnswer(e) {
    if (isAnswering) return;

    isAnswering = true;
    const selectedAnswer = parseInt(e.target.dataset.answer);
    const isCorrect = selectedAnswer === currentAnswer;

    // Disable all buttons
    answerButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        handleCorrectAnswer(e.target);
    } else {
        handleWrongAnswer(e.target);
    }
}

// Handle correct answer
function handleCorrectAnswer(button) {
    button.classList.add('correct');
    currentStreak++;

    // Update best streak if needed
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        saveBestStreak();
    }

    // Show positive feedback
    const messages = ['Rätt! 🎉', 'Jättebra! ⭐', 'Perfekt! 🌟', 'Härligt! 🎈'];
    feedbackEl.textContent = messages[randomNumber(0, messages.length - 1)];
    feedbackEl.className = 'feedback correct';

    updateDisplay();

    // Generate next problem after delay
    setTimeout(() => {
        generateNewProblem();
    }, 1500);
}

// Handle wrong answer
function handleWrongAnswer(button) {
    button.classList.add('wrong');
    strikes++;

    // Show correct answer
    answerButtons.forEach(btn => {
        if (parseInt(btn.dataset.answer) === currentAnswer) {
            btn.classList.add('correct');
        }
    });

    feedbackEl.textContent = `Rätt svar är ${currentAnswer}`;
    feedbackEl.className = 'feedback wrong';

    updateDisplay();

    // Check for game over
    if (strikes >= 3) {
        setTimeout(() => {
            showGameOver();
        }, 2000);
    } else {
        // Continue with next problem
        setTimeout(() => {
            generateNewProblem();
        }, 2000);
    }
}

// Update display (streak, best streak, lives)
function updateDisplay() {
    currentStreakEl.textContent = currentStreak;
    bestStreakEl.textContent = bestStreak;

    // Update hearts
    const hearts = livesEl.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index < strikes) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

// Show game over modal
function showGameOver() {
    finalStreakEl.textContent = currentStreak;

    // Set encouraging message based on streak
    let message = '';
    if (currentStreak === 0) {
        message = 'Ingen fara! Det tar lite tid att komma igång. 🌱';
    } else if (currentStreak < 5) {
        message = 'Bra början! Fortsätt öva så blir du ännu bättre! 🌟';
    } else if (currentStreak < 10) {
        message = 'Jättebra! Du håller på att bli riktigt duktig! 🎈';
    } else {
        message = 'Fantastiskt! Du är en riktig mattechampion! 🏆';
    }

    modalMessage.innerHTML = `Du klarade en rad på <span id="finalStreak">${currentStreak}</span>!`;
    document.querySelector('.encouragement').textContent = message;

    gameOverModal.classList.remove('hidden');
}

// Restart game (in current mode)
function restartGame() {
    currentStreak = 0;
    strikes = 0;
    gameOverModal.classList.add('hidden');

    // Reload best streak for current mode
    loadBestStreak();

    updateDisplay();
    generateNewProblem();
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', init);
