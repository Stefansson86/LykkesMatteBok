// Game state
let currentStreak = 0;
let bestStreak = 0;
let strikes = 0;
let currentAnswer = 0;
let isAnswering = false;

// DOM elements
const equationEl = document.getElementById('equation');
const currentStreakEl = document.getElementById('currentStreak');
const bestStreakEl = document.getElementById('bestStreak');
const livesEl = document.getElementById('lives');
const feedbackEl = document.getElementById('feedback');
const answerButtons = document.querySelectorAll('.answer-btn');
const gameOverModal = document.getElementById('gameOverModal');
const finalStreakEl = document.getElementById('finalStreak');
const restartBtn = document.getElementById('restartBtn');
const modalMessage = document.getElementById('modalMessage');

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
    loadBestStreak();
    updateDisplay();
    generateNewProblem();

    // Add event listeners
    answerButtons.forEach(btn => {
        btn.addEventListener('click', handleAnswer);
    });

    restartBtn.addEventListener('click', restartGame);
}

// Load best streak from localStorage
function loadBestStreak() {
    const saved = localStorage.getItem('bestStreak');
    if (saved) {
        bestStreak = parseInt(saved);
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

// Generate new math problem
function generateNewProblem() {
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

// Generate 4 answer options (1 correct, 3 wrong)
function generateAnswerOptions(correctAnswer) {
    const answers = [correctAnswer];

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

        // Ensure answer is positive and unique
        if (wrongAnswer > 0 && wrongAnswer <= 20 && !answers.includes(wrongAnswer)) {
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
