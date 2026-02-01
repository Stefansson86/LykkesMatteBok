// Game state
const GameMode = {
    MENU: 'MENU',
    MATH: 'MATH',
    CLOCK: 'CLOCK'
};

let currentState = {
    mode: GameMode.MENU,
    lives: 3,
    strikes: 0,
    currentStreak: 0,
    // Best streaks stored separately
    bestStreakMath: parseInt(localStorage.getItem('bestStreak_math') || '0'),
    bestStreakClock: parseInt(localStorage.getItem('bestStreak_clock') || '0')
};

// DOM Elements
const elements = {
    menu: document.getElementById('main-menu'),
    header: document.getElementById('gameHeader'),
    mathGame: document.getElementById('math-game'),
    clockGame: document.getElementById('clock-game'),
    lives: document.getElementById('lives'),
    currentStreak: document.getElementById('currentStreak'),
    feedback: document.getElementById('feedback'),
    modal: document.getElementById('gameOverModal'),
    modalMessage: document.getElementById('modalMessage'),
    restartBtn: document.getElementById('restartBtn'),
    menuBtn: document.getElementById('menuBtn'),
    backBtn: document.getElementById('backBtn'),
    // Math specific
    equation: document.getElementById('equation'),
    mathAnswers: document.getElementById('mathAnswers'),
    mathLabel: document.querySelector('#math-game .question-label'),
    // Clock specific
    clockDisplay: document.getElementById('clockDisplay'),
    clockAnswers: document.getElementById('clockAnswers'),
    hourHand: document.getElementById('hourHand'),
    minuteHand: document.getElementById('minuteHand')
};

// Encouraging messages
const encouragingMessages = [
    "Bra jobbat! Fortsätt så här! 🌟",
    "Du är jätteduktig! Kör hårt! 💪",
    "Fantastiskt! Du lär dig så fort! 🎈",
    "Toppen! Du kommer bli matteproffs! 🚀",
    "Underbart! Fortsätt öva! 🌈"
];

// --- Game Logic Base ---

function init() {
    setupEventListeners();
    showMenu();
}

function setupEventListeners() {
    document.getElementById('startMathBtn').addEventListener('click', () => startGame(GameMode.MATH));
    document.getElementById('startClockBtn').addEventListener('click', () => startGame(GameMode.CLOCK));
    elements.backBtn.addEventListener('click', showMenu);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.menuBtn.addEventListener('click', () => {
        elements.modal.classList.add('hidden');
        showMenu();
    });
}

function showMenu() {
    currentState.mode = GameMode.MENU;
    elements.menu.classList.remove('hidden');
    elements.header.classList.add('hidden');
    elements.mathGame.classList.add('hidden');
    elements.clockGame.classList.add('hidden');
    elements.feedback.textContent = '';
    elements.modal.classList.add('hidden');
}

function startGame(mode) {
    currentState.mode = mode;
    currentState.lives = 3;
    currentState.strikes = 0;
    currentState.currentStreak = 0;

    // Show/Hide containers
    elements.menu.classList.add('hidden');
    elements.header.classList.remove('hidden');

    if (mode === GameMode.MATH) {
        elements.mathGame.classList.remove('hidden');
        elements.clockGame.classList.add('hidden');
        generateMathProblem();
    } else if (mode === GameMode.CLOCK) {
        elements.mathGame.classList.add('hidden');
        elements.clockGame.classList.remove('hidden');
        generateClockProblem();
    }

    updateDisplay();
}

function updateDisplay() {
    elements.currentStreak.textContent = currentState.currentStreak;

    // Update hearts
    const hearts = elements.lives.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index < currentState.strikes) {
            heart.classList.add('lost');
        } else {
            heart.classList.remove('lost');
        }
    });
}

function handleAnswer(selectedAnswer, correctAnswer, correctCallback, wrongCallback) {
    const isCorrect = selectedAnswer === correctAnswer;

    // Disable buttons temporarily managed by game specific functions

    if (isCorrect) {
        currentState.currentStreak++;
        updateBestStreak();
        showFeedback(true);
        updateDisplay();
        setTimeout(correctCallback, 1500);
    } else {
        currentState.strikes++;
        updateDisplay();

        if (currentState.strikes >= 3) {
            showFeedback(false, correctAnswer);
            setTimeout(showGameOver, 2000);
        } else {
            showFeedback(false, correctAnswer);
            // Optionally delay next problem or just let them retry? 
            // Original game showed feedback then refreshed.
            // Let's stick to "Next Problem" after wrong answer too, but allow seeing the right one.
            setTimeout(wrongCallback, 2000);
        }
    }
}

function updateBestStreak() {
    if (currentState.mode === GameMode.MATH) {
        if (currentState.currentStreak > currentState.bestStreakMath) {
            currentState.bestStreakMath = currentState.currentStreak;
            localStorage.setItem('bestStreak_math', currentState.bestStreakMath);
        }
    } else {
        if (currentState.currentStreak > currentState.bestStreakClock) {
            currentState.bestStreakClock = currentState.currentStreak;
            localStorage.setItem('bestStreak_clock', currentState.bestStreakClock);
        }
    }
}

function showFeedback(isCorrect, correctAnswerText) {
    if (isCorrect) {
        const messages = ['Rätt! 🎉', 'Jättebra! ⭐', 'Perfekt! 🌟', 'Härligt! 🎈'];
        elements.feedback.textContent = messages[Math.floor(Math.random() * messages.length)];
        elements.feedback.className = 'feedback correct';
    } else {
        elements.feedback.textContent = `Rätt svar var ${correctAnswerText}`;
        elements.feedback.className = 'feedback wrong';
    }
}

function showGameOver() {
    elements.modal.classList.remove('hidden');
    elements.modalMessage.innerHTML = `Du klarade en rad på <span id="finalStreak">${currentState.currentStreak}</span>!`;

    let message = '';
    if (currentState.currentStreak === 0) {
        message = 'Ingen fara! Det tar lite tid att komma igång. 🌱';
    } else if (currentState.currentStreak < 5) {
        message = 'Bra början! Fortsätt öva så blir du ännu bättre! 🌟';
    } else if (currentState.currentStreak < 10) {
        message = 'Jättebra! Du håller på att bli riktigt duktig! 🎈';
    } else {
        message = 'Fantastiskt! Du är en riktig mattechampion! 🏆';
    }
    document.querySelector('.encouragement').textContent = message;
}

function restartGame() {
    elements.modal.classList.add('hidden');
    startGame(currentState.mode);
}

// --- Math Game Logic ---

function generateMathProblem() {
    elements.feedback.textContent = '';

    // Determine operation first
    const isAddition = Math.random() < 0.5;

    let answer, equationText, labelText;

    if (isAddition) {
        // Highest possible answer for is 20
        // We pick the answer first to ensure we cover the full range (2-20)
        answer = randomNumber(2, 20);

        // Decompose into two numbers
        // Ensure num1 is at least 1 and at most answer-1 (so num2 is also at least 1)
        const num1 = randomNumber(1, answer - 1);
        const num2 = answer - num1;

        equationText = `${num1} + ${num2}`;
        labelText = "VAD ÄR SUMMAN?";
    } else {
        // Highest possible Term is 20 for subtraction
        const num1 = randomNumber(1, 20);
        const num2 = randomNumber(1, 20);

        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);

        answer = larger - smaller;
        equationText = `${larger} - ${smaller}`;
        labelText = "VAD ÄR SKILLNADEN?";
    }

    elements.equation.textContent = equationText;
    if (elements.mathLabel) elements.mathLabel.textContent = labelText;
    setupMathButtons(answer);
}

function setupMathButtons(correctAnswer) {
    const answers = [correctAnswer];
    while (answers.length < 4) {
        const offset = randomNumber(1, 5);
        const wrong = Math.random() < 0.5 ? correctAnswer + offset : correctAnswer - offset;
        if (wrong >= 0 && !answers.includes(wrong)) {
            answers.push(wrong);
        }
    }
    shuffleArray(answers);

    const buttons = elements.mathAnswers.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.textContent = answers[index];
        btn.disabled = false;
        btn.className = 'answer-btn';

        // Clone to remove old listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            // Disable all buttons
            elements.mathAnswers.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

            if (answers[index] === correctAnswer) {
                newBtn.classList.add('correct');
                handleAnswer(answers[index], correctAnswer, generateMathProblem, generateMathProblem);
            } else {
                newBtn.classList.add('wrong');
                // Highlight correct
                elements.mathAnswers.querySelectorAll('.answer-btn').forEach((b, i) => {
                    if (answers[i] === correctAnswer) b.classList.add('correct');
                });
                handleAnswer(answers[index], correctAnswer, generateMathProblem, generateMathProblem);
            }
        });
    });
}

// --- Clock Game Logic ---

function generateClockProblem() {
    elements.feedback.textContent = '';

    // Generate time (hours 0-23, minutes 0, 15, 30, 45)
    // To make it kid friendly, let's stick to 12h format for answers perhaps? 
    // Or 24h? Valid question. In Sweden we use 24h digital usually, but "klockan 2" is ambiguous.
    // Let's generate 0-23 for internal, but maybe display answers as 00:00 - 23:59

    const hour = randomNumber(0, 23);
    const minute = [0, 15, 30, 45][randomNumber(0, 3)];

    renderClock(hour, minute);
    setupClockButtons(hour, minute);
}

function renderClock(hour, minute) {
    // Hour hand moves slightly based on minutes
    // 12 hours = 360 degrees => 1 hour = 30 degrees
    // 60 minutes = 30 degrees (hour hand movement) => 1 minute = 0.5 degrees
    const hourDegrees = ((hour % 12) * 30) + (minute * 0.5);
    const minuteDegrees = minute * 6;

    elements.hourHand.setAttribute('transform', `rotate(${hourDegrees}, 100, 100)`);
    elements.minuteHand.setAttribute('transform', `rotate(${minuteDegrees}, 100, 100)`);
}

function setupClockButtons(correctHour, correctMinute) {
    const timeToSwedish = (h, m) => {
        // Convert to 12-hour format for the number
        let displayHour = h % 12;
        if (displayHour === 0) displayHour = 12;

        // For half and quarter to, we refer to the NEXT hour
        let nextHour = (h + 1) % 12;
        if (nextHour === 0) nextHour = 12;

        switch (m) {
            case 0:
                return `klockan ${displayHour}`;
            case 15:
                return `kvart över ${displayHour}`;
            case 30:
                return `halv ${nextHour}`;
            case 45:
                return `kvart i ${nextHour}`;
            default:
                return `${h}:${m}`;
        }
    };

    // Store exact correct values to check against, but display text
    const correctString = timeToSwedish(correctHour, correctMinute);
    const answers = [correctString];

    while (answers.length < 4) {
        // Generate wrong answers
        let h = randomNumber(0, 23); // Keep using 24h internal logic for generation
        let m = [0, 15, 30, 45][randomNumber(0, 3)];

        const wrongString = timeToSwedish(h, m);

        // Ensure unique text representation
        if (!answers.includes(wrongString)) {
            answers.push(wrongString);
        }
    }

    shuffleArray(answers);

    const buttons = elements.clockAnswers.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.textContent = answers[index];
        btn.disabled = false;
        btn.className = 'answer-btn';
        // Adjust font size for text
        btn.style.fontSize = '1.5em';

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            elements.clockAnswers.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

            if (answers[index] === correctString) {
                newBtn.classList.add('correct');
                handleAnswer(answers[index], correctString, generateClockProblem, generateClockProblem);
            } else {
                newBtn.classList.add('wrong');
                elements.clockAnswers.querySelectorAll('.answer-btn').forEach((b, i) => {
                    if (answers[i] === correctString) b.classList.add('correct');
                });
                handleAnswer(answers[index], correctString, generateClockProblem, generateClockProblem);
            }
        });
    });
}

// --- Utils ---

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start
window.addEventListener('DOMContentLoaded', init);
