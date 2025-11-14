// Game state
let currentStreak = 0;
let bestStreak = 0;
let strikes = 0;
let currentAnswer = 0;
let isAnswering = false;
let gameMode = null; // 'normal' or 'pairs'

// DOM elements (initialized after DOM loads)
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
let normalModeBtn;
let pairsModeBtn;
let backBtn;
let backBtnContainer;

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
    // Initialize all DOM elements
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
    normalModeBtn = document.getElementById('normalModeBtn');
    pairsModeBtn = document.getElementById('pairsModeBtn');
    backBtn = document.getElementById('backBtn');
    backBtnContainer = document.getElementById('backBtnContainer');

    // Add event listeners for answer buttons
    answerButtons.forEach(btn => {
        btn.addEventListener('click', handleAnswer);
    });

    // Add event listeners for menu buttons
    normalModeBtn.addEventListener('click', () => startGame('normal'));
    pairsModeBtn.addEventListener('click', () => startGame('pairs'));

    // Add event listener for back button
    backBtn.addEventListener('click', returnToMenu);

    // Add event listener for restart button
    restartBtn.addEventListener('click', restartGame);

    // Show menu initially
    showMenu();
}

// Show menu screen
function showMenu() {
    menuScreen.classList.remove('hidden');
    gameHeader.classList.add('hidden');
    gameArea.classList.add('hidden');
    feedbackEl.classList.add('hidden');
    backBtnContainer.classList.add('hidden');
    gameMode = null;
}

// Start game with selected mode
function startGame(mode) {
    gameMode = mode;
    currentStreak = 0;
    strikes = 0;

    // Load best streak
    loadBestStreak();

    // Show game, hide menu
    menuScreen.classList.add('hidden');
    gameHeader.classList.remove('hidden');
    gameArea.classList.remove('hidden');
    feedbackEl.classList.remove('hidden');
    backBtnContainer.classList.remove('hidden');

    // Update display and generate first problem
    updateDisplay();
    generateNewProblem();
}

// Return to menu
function returnToMenu() {
    if (isAnswering) return;

    // Ask for confirmation if game is in progress
    if (currentStreak > 0 || strikes > 0) {
        if (!confirm('Är du säker på att du vill avsluta? Din nuvarande rad kommer att förloras.')) {
            return;
        }
    }

    showMenu();
}

// Load best streak from localStorage
function loadBestStreak() {
    const saved = localStorage.getItem('bestStreak');
    if (saved) {
        bestStreak = parseInt(saved);
    } else {
        bestStreak = 0;
    }
}

// Save best streak to localStorage
function saveBestStreak() {
    localStorage.setItem('bestStreak', bestStreak);
}

// Generate a random number within range
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate new math problem based on game mode
function generateNewProblem() {
    // Reset answering flag
    isAnswering = false;

    // Clear feedback
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';

    // Completely reset all buttons
    answerButtons.forEach(btn => {
        // Stop any animations
        btn.style.animation = 'none';
        // Remove all state classes
        btn.classList.remove('correct', 'wrong');
        // Reset to base class only
        btn.className = 'answer-btn';
        // Enable button
        btn.disabled = false;
        // Clear all inline styles
        btn.removeAttribute('style');
    });

    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
        // Now generate the new problem
        if (gameMode === 'pairs') {
            generatePairsProblem();
        } else {
            generateNormalProblem();
        }
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
    equationEl.textContent = `${num} + _ = 10`;

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

// Restart game
function restartGame() {
    currentStreak = 0;
    strikes = 0;
    gameOverModal.classList.add('hidden');
    updateDisplay();
    generateNewProblem();
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', init);
