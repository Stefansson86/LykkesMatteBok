// Game state
const GameMode = {
    MENU: 'MENU',
    MATH: 'MATH',
    CROSSING: 'CROSSING',
    MULTIPLICATION: 'MULTIPLICATION',
    CLOCK: 'CLOCK',
    SET_CLOCK: 'SET_CLOCK'
};

const Difficulty = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

const DIFFICULTY_INFO = {
    easy: { label: 'Lätt', desc: 'Tal 1–10 • Hel & halv' },
    medium: { label: 'Medel', desc: 'Tal 1–20 • Hel, halv & kvart' },
    hard: { label: 'Svår', desc: 'Tal 1–50 & × • Var 5:e minut' }
};

let currentState = {
    mode: GameMode.MENU,
    difficulty: localStorage.getItem('lykke_difficulty') || Difficulty.MEDIUM,
    clockStyle: localStorage.getItem('lykke_clock_style') || 'analog',
    lives: 3,
    strikes: 0,
    currentStreak: 0,
    isNewRecord: false,
    currentProblem: null,
    lastProblemKey: null,
    pendingTimeout: null,
    setClock: { hour: 12, minute: 0, locked: false }
};

let deferredInstallPrompt = null;

// DOM Elements
const elements = {
    menu: document.getElementById('main-menu'),
    header: document.getElementById('gameHeader'),
    mathGame: document.getElementById('math-game'),
    clockGame: document.getElementById('clock-game'),
    setClockGame: document.getElementById('set-clock-game'),
    lives: document.getElementById('lives'),
    currentStreak: document.getElementById('currentStreak'),
    levelBadge: document.getElementById('levelBadge'),
    feedback: document.getElementById('feedback'),
    modal: document.getElementById('gameOverModal'),
    modalMessage: document.getElementById('modalMessage'),
    modalRecord: document.getElementById('modalRecord'),
    restartBtn: document.getElementById('restartBtn'),
    menuBtn: document.getElementById('menuBtn'),
    backBtn: document.getElementById('backBtn'),
    installBtn: document.getElementById('installBtn'),
    difficultySelector: document.getElementById('difficultySelector'),
    difficultyDesc: document.getElementById('difficultyDesc'),
    mathBestBadge: document.getElementById('mathBestBadge'),
    crossingBestBadge: document.getElementById('crossingBestBadge'),
    multBestBadge: document.getElementById('multBestBadge'),
    clockBestBadge: document.getElementById('clockBestBadge'),
    setClockBestBadge: document.getElementById('setClockBestBadge'),
    // Math specific
    equation: document.getElementById('equation'),
    mathAnswers: document.getElementById('mathAnswers'),
    mathLabel: document.querySelector('#math-game .question-label'),
    mathHintBtn: document.getElementById('mathHintBtn'),
    mathSpeakBtn: document.getElementById('mathSpeakBtn'),
    mathHintBox: document.getElementById('mathHintBox'),
    // Clock specific
    clockStyleToggle: document.getElementById('clockStyleToggle'),
    clockDisplay: document.getElementById('clockDisplay'),
    digitalClockDisplay: document.getElementById('digitalClockDisplay'),
    digitalTimeText: document.getElementById('digitalTimeText'),
    clockAnswers: document.getElementById('clockAnswers'),
    hourHand: document.getElementById('hourHand'),
    minuteHand: document.getElementById('minuteHand'),
    clockTicks: document.getElementById('clockTicks'),
    clockNumbers: document.getElementById('clockNumbers'),
    clockHintBtn: document.getElementById('clockHintBtn'),
    clockSpeakBtn: document.getElementById('clockSpeakBtn'),
    clockHintBox: document.getElementById('clockHintBox'),
    // Set Clock specific
    targetTimeText: document.getElementById('targetTimeText'),
    setClockSvg: document.getElementById('setClockSvg'),
    setClockTicks: document.getElementById('setClockTicks'),
    setClockNumbers: document.getElementById('setClockNumbers'),
    setHourHand: document.getElementById('setHourHand'),
    setMinuteHand: document.getElementById('setMinuteHand'),
    setClockHintBtn: document.getElementById('setClockHintBtn'),
    setClockSpeakBtn: document.getElementById('setClockSpeakBtn'),
    setClockHintBox: document.getElementById('setClockHintBox'),
    hourDownBtn: document.getElementById('hourDownBtn'),
    hourUpBtn: document.getElementById('hourUpBtn'),
    minDownBtn: document.getElementById('minDownBtn'),
    minUpBtn: document.getElementById('minUpBtn'),
    checkClockBtn: document.getElementById('checkClockBtn')
};

// --- Storage Helpers ---

function getModeStorageKey(mode) {
    if (mode === GameMode.MATH) return 'math';
    if (mode === GameMode.CROSSING) return 'crossing';
    if (mode === GameMode.MULTIPLICATION) return 'mult';
    if (mode === GameMode.SET_CLOCK) return 'set_clock';
    return 'clock';
}

function getBestStreakKey(mode, difficulty) {
    return `bestStreak_${getModeStorageKey(mode)}_${difficulty}`;
}

function getBestStreak(mode, difficulty = currentState.difficulty) {
    const key = getBestStreakKey(mode, difficulty);
    const stored = localStorage.getItem(key);
    if (stored !== null) return parseInt(stored, 10) || 0;

    // Fallback for legacy medium-level streaks
    if (difficulty === Difficulty.MEDIUM && mode !== GameMode.SET_CLOCK) {
        const legacyKey = mode === GameMode.MATH ? 'bestStreak_math' : 'bestStreak_clock';
        return parseInt(localStorage.getItem(legacyKey) || '0', 10) || 0;
    }
    return 0;
}

function saveBestStreak(mode, value) {
    localStorage.setItem(getBestStreakKey(mode, currentState.difficulty), String(value));
}

function getMissedKey(mode) {
    return `missed_${getModeStorageKey(mode)}_${currentState.difficulty}`;
}

function getMissedProblems(mode) {
    try {
        return JSON.parse(localStorage.getItem(getMissedKey(mode)) || '[]');
    } catch {
        return [];
    }
}

function recordMissedProblem(mode, problem, problemKey) {
    const list = getMissedProblems(mode).filter((item) => item.key !== problemKey);
    list.push({ key: problemKey, problem });
    if (list.length > 15) list.shift();
    localStorage.setItem(getMissedKey(mode), JSON.stringify(list));
}

function clearMissedProblem(mode, problemKey) {
    const list = getMissedProblems(mode).filter((item) => item.key !== problemKey);
    localStorage.setItem(getMissedKey(mode), JSON.stringify(list));
}

// --- Initialization & PWA ---

function init() {
    initClockDial(elements.clockTicks, elements.clockNumbers);
    initClockDial(elements.setClockTicks, elements.setClockNumbers);
    setupEventListeners();
    setupSetClockListeners();
    setupPWA();
    updateDifficultyUI();
    showMenu();
}

function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            // Service worker registration failed silently (e.g. file:// protocol)
        });
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        if (elements.installBtn) {
            elements.installBtn.classList.remove('hidden');
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        if (elements.installBtn) {
            elements.installBtn.classList.add('hidden');
        }
    });

    if (elements.installBtn) {
        elements.installBtn.addEventListener('click', async () => {
            if (!deferredInstallPrompt) return;
            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            elements.installBtn.classList.add('hidden');
        });
    }
}

function setupEventListeners() {
    document.getElementById('startMathBtn').addEventListener('click', () => startGame(GameMode.MATH));
    document.getElementById('startCrossingBtn').addEventListener('click', () => startGame(GameMode.CROSSING));
    document.getElementById('startMultBtn').addEventListener('click', () => startGame(GameMode.MULTIPLICATION));
    document.getElementById('startClockBtn').addEventListener('click', () => startGame(GameMode.CLOCK));
    document.getElementById('startSetClockBtn').addEventListener('click', () => startGame(GameMode.SET_CLOCK));
    elements.backBtn.addEventListener('click', showMenu);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.menuBtn.addEventListener('click', () => {
        elements.modal.classList.add('hidden');
        showMenu();
    });

    elements.difficultySelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.diff-btn');
        if (!btn) return;
        const level = btn.dataset.level;
        if (!DIFFICULTY_INFO[level]) return;
        currentState.difficulty = level;
        localStorage.setItem('lykke_difficulty', level);
        updateDifficultyUI();
    });

    elements.clockStyleToggle.addEventListener('click', (e) => {
        const btn = e.target.closest('.clock-style-btn');
        if (!btn) return;
        const style = btn.dataset.style;
        if (style !== 'analog' && style !== 'digital') return;
        currentState.clockStyle = style;
        localStorage.setItem('lykke_clock_style', style);
        updateClockStyleUI();
        if (currentState.mode === GameMode.CLOCK) {
            clearPendingTimeout();
            generateClockProblem();
        }
    });

    elements.mathHintBtn.addEventListener('click', showMathHint);
    elements.clockHintBtn.addEventListener('click', showClockHint);
    elements.mathSpeakBtn.addEventListener('click', speakMathProblem);
    elements.clockSpeakBtn.addEventListener('click', () => speakText('Vad är klockan?'));
}

function updateDifficultyUI() {
    const buttons = elements.difficultySelector.querySelectorAll('.diff-btn');
    buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.level === currentState.difficulty);
    });

    const info = DIFFICULTY_INFO[currentState.difficulty] || DIFFICULTY_INFO.medium;
    elements.difficultyDesc.textContent = info.desc;
    elements.levelBadge.textContent = info.label;
    updateMenuBadges();
}

function updateMenuBadges() {
    elements.mathBestBadge.textContent = `Rekord: ${getBestStreak(GameMode.MATH)} ⭐`;
    elements.crossingBestBadge.textContent = `Rekord: ${getBestStreak(GameMode.CROSSING)} ⭐`;
    elements.multBestBadge.textContent = `Rekord: ${getBestStreak(GameMode.MULTIPLICATION)} ⭐`;
    elements.clockBestBadge.textContent = `Rekord: ${getBestStreak(GameMode.CLOCK)} ⭐`;
    elements.setClockBestBadge.textContent = `Rekord: ${getBestStreak(GameMode.SET_CLOCK)} ⭐`;
}

// --- Navigation & Shared Game Flow ---

function clearPendingTimeout() {
    if (currentState.pendingTimeout !== null) {
        clearTimeout(currentState.pendingTimeout);
        currentState.pendingTimeout = null;
    }
}

function showMenu() {
    clearPendingTimeout();
    currentState.mode = GameMode.MENU;
    elements.menu.classList.remove('hidden');
    elements.header.classList.add('hidden');
    elements.mathGame.classList.add('hidden');
    elements.clockGame.classList.add('hidden');
    elements.setClockGame.classList.add('hidden');
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.modal.classList.add('hidden');
    updateMenuBadges();
}

function startGame(mode) {
    clearPendingTimeout();
    currentState.mode = mode;
    currentState.lives = 3;
    currentState.strikes = 0;
    currentState.currentStreak = 0;
    currentState.isNewRecord = false;
    currentState.lastProblemKey = null;

    elements.menu.classList.add('hidden');
    elements.header.classList.remove('hidden');
    elements.levelBadge.textContent = (DIFFICULTY_INFO[currentState.difficulty] || DIFFICULTY_INFO.medium).label;

    elements.mathGame.classList.add('hidden');
    elements.clockGame.classList.add('hidden');
    elements.setClockGame.classList.add('hidden');

    if (mode === GameMode.MATH || mode === GameMode.CROSSING || mode === GameMode.MULTIPLICATION) {
        elements.mathGame.classList.remove('hidden');
        generateMathProblem();
    } else if (mode === GameMode.CLOCK) {
        elements.clockGame.classList.remove('hidden');
        generateClockProblem();
    } else if (mode === GameMode.SET_CLOCK) {
        elements.setClockGame.classList.remove('hidden');
        generateSetClockProblem();
    }

    updateDisplay();
}

function updateDisplay() {
    elements.currentStreak.textContent = currentState.currentStreak;

    const hearts = elements.lives.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        heart.classList.toggle('lost', index < currentState.strikes);
    });
}

function handleAnswer(selectedAnswer, correctAnswer, problemKey, nextCallback) {
    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
        currentState.currentStreak++;
        clearMissedProblem(currentState.mode, problemKey);
        updateBestStreak();
        showFeedback(true);
        updateDisplay();
        currentState.pendingTimeout = setTimeout(nextCallback, 1350);
    } else {
        currentState.strikes++;
        recordMissedProblem(currentState.mode, currentState.currentProblem, problemKey);
        updateDisplay();
        showFeedback(false, correctAnswer);

        if (currentState.strikes >= 3) {
            currentState.pendingTimeout = setTimeout(showGameOver, 1800);
        } else {
            currentState.pendingTimeout = setTimeout(nextCallback, 1800);
        }
    }
}

function updateBestStreak() {
    const best = getBestStreak(currentState.mode);
    if (currentState.currentStreak > best) {
        saveBestStreak(currentState.mode, currentState.currentStreak);
        currentState.isNewRecord = true;
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
    elements.modalRecord.classList.toggle('hidden', !currentState.isNewRecord);

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

// --- Speech Synthesis ---

function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'sv-SE';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function speakMathProblem() {
    const p = currentState.currentProblem;
    if (!p) return;
    const opWord = p.op === '+' ? 'plus' : p.op === '-' ? 'minus' : 'gånger';
    speakText(`Vad är ${p.a} ${opWord} ${p.b}?`);
}

// --- Math Game Logic ---

function pickMissedOrNew(mode, generator) {
    const missed = getMissedProblems(mode).filter((item) => item.key !== currentState.lastProblemKey);
    if (missed.length > 0 && Math.random() < 0.3) {
        const chosen = missed[Math.floor(Math.random() * missed.length)];
        return chosen.problem;
    }
    return generator();
}

function createMathProblemData() {
    const level = currentState.difficulty;

    if (level === Difficulty.EASY) {
        if (Math.random() < 0.5) {
            const answer = randomNumber(2, 10);
            const a = randomNumber(1, answer - 1);
            return { op: '+', a, b: answer - a, answer };
        }
        const n1 = randomNumber(1, 10);
        const n2 = randomNumber(1, 10);
        const a = Math.max(n1, n2);
        const b = Math.min(n1, n2);
        return { op: '-', a, b, answer: a - b };
    }

    if (level === Difficulty.HARD) {
        const roll = Math.random();
        if (roll < 0.35) {
            const factors = [2, 3, 4, 5, 10];
            const a = factors[randomNumber(0, factors.length - 1)];
            const b = randomNumber(1, 10);
            return { op: '×', a, b, answer: a * b };
        }
        if (roll < 0.68) {
            const answer = randomNumber(10, 50);
            const a = randomNumber(2, answer - 2);
            return { op: '+', a, b: answer - a, answer };
        }
        const n1 = randomNumber(5, 50);
        const n2 = randomNumber(2, 45);
        const a = Math.max(n1, n2);
        const b = Math.min(n1, n2);
        return { op: '-', a, b, answer: a - b };
    }

    // Medium (default 1-20)
    if (Math.random() < 0.5) {
        const answer = randomNumber(2, 20);
        const a = randomNumber(1, answer - 1);
        return { op: '+', a, b: answer - a, answer };
    }
    const n1 = randomNumber(1, 20);
    const n2 = randomNumber(1, 20);
    const a = Math.max(n1, n2);
    const b = Math.min(n1, n2);
    return { op: '-', a, b, answer: a - b };
}

function createCrossingProblemData() {
    const level = currentState.difficulty;
    const isAddition = Math.random() < 0.5;
    const maxTen = level === Difficulty.EASY ? 0 : level === Difficulty.MEDIUM ? 3 : 8;
    const baseTen = randomNumber(0, maxTen) * 10;

    if (isAddition) {
        const onesA = randomNumber(2, 9);
        const minOnesB = 11 - onesA;
        const onesB = randomNumber(minOnesB, 9);
        const a = baseTen + onesA;
        const b = onesB;
        return { op: '+', a, b, answer: a + b };
    }

    // Subtraktion med tiotalsövergång: t.ex. 14 - 6 = 8 eller 32 - 7 = 25
    const upperTen = (randomNumber(1, maxTen + 1)) * 10;
    const onesA = randomNumber(1, 8);
    const onesB = randomNumber(onesA + 1, 9);
    const a = upperTen + onesA;
    const b = onesB;
    return { op: '-', a, b, answer: a - b };
}

function createMultiplicationProblemData() {
    const level = currentState.difficulty;
    const tables = level === Difficulty.EASY
        ? [1, 2, 5, 10]
        : level === Difficulty.MEDIUM
            ? [2, 3, 4, 5, 10]
            : [2, 3, 4, 5, 6, 7, 8, 9, 10];

    const a = tables[randomNumber(0, tables.length - 1)];
    const b = randomNumber(1, 10);
    return { op: '×', a, b, answer: a * b };
}

function generateMathProblem() {
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.mathHintBox.classList.add('hidden');
    elements.mathHintBox.innerHTML = '';

    const generator = currentState.mode === GameMode.CROSSING
        ? createCrossingProblemData
        : currentState.mode === GameMode.MULTIPLICATION
            ? createMultiplicationProblemData
            : createMathProblemData;

    let problem = pickMissedOrNew(currentState.mode, generator);
    let key = `${problem.a}${problem.op}${problem.b}`;
    if (key === currentState.lastProblemKey) {
        problem = generator();
        key = `${problem.a}${problem.op}${problem.b}`;
    }

    currentState.currentProblem = problem;
    currentState.lastProblemKey = key;

    const labelMap = {
        '+': 'VAD ÄR SUMMAN?',
        '-': 'VAD ÄR SKILLNADEN?',
        '×': 'VAD ÄR PRODUKTEN?'
    };

    elements.equation.textContent = `${problem.a} ${problem.op} ${problem.b}`;
    if (elements.mathLabel) elements.mathLabel.textContent = labelMap[problem.op];
    setupMathButtons(problem.answer, key);
}

function showMathHint() {
    const p = currentState.currentProblem;
    if (!p) return;

    elements.mathHintBox.classList.remove('hidden');

    if (currentState.mode === GameMode.CROSSING) {
        if (p.op === '+') {
            const nextTen = Math.ceil((p.a + 1) / 10) * 10;
            const toTen = nextTen - p.a;
            const rest = p.b - toTen;
            elements.mathHintBox.textContent = `Stanna vid ${nextTen}: ${p.a} + ${toTen} = ${nextTen}, sen ${nextTen} + ${rest}!`;
        } else {
            const prevTen = Math.floor(p.a / 10) * 10;
            const toTen = p.a - prevTen;
            const rest = p.b - toTen;
            elements.mathHintBox.textContent = `Stanna vid ${prevTen}: ${p.a} − ${toTen} = ${prevTen}, sen ${prevTen} − ${rest}!`;
        }
        return;
    }

    if (p.op === '+' && p.answer <= 20) {
        const groupA = '🍎'.repeat(p.a);
        const groupB = '🍊'.repeat(p.b);
        elements.mathHintBox.innerHTML = `Räkna alla tillsammans:<div class="hint-dots">${groupA} + ${groupB}</div>`;
    } else if (p.op === '-' && p.a <= 20) {
        const kept = '🍎'.repeat(p.a - p.b);
        const removed = `<span class="hint-dot crossed">${'🍎'.repeat(p.b)}</span>`;
        elements.mathHintBox.innerHTML = `Börja med ${p.a} och ta bort ${p.b}:<div class="hint-dots">${kept}${removed}</div>`;
    } else if (p.op === '×') {
        const sumText = Array(p.a).fill(p.b).join(' + ');
        elements.mathHintBox.textContent = `Tips: ${p.a} × ${p.b} är samma som ${sumText}`;
    } else {
        elements.mathHintBox.textContent = 'Tips: Dela upp talen i tiotal och ental var för sig!';
    }
}

function setupMathButtons(correctAnswer, problemKey) {
    const answers = [correctAnswer];
    const maxOffset = currentState.difficulty === Difficulty.HARD ? 9 : 5;

    while (answers.length < 4) {
        const offset = randomNumber(1, maxOffset);
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

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            elements.mathAnswers.querySelectorAll('.answer-btn').forEach((b) => (b.disabled = true));

            if (answers[index] === correctAnswer) {
                newBtn.classList.add('correct');
            } else {
                newBtn.classList.add('wrong');
                elements.mathAnswers.querySelectorAll('.answer-btn').forEach((b, i) => {
                    if (answers[i] === correctAnswer) b.classList.add('correct');
                });
            }
            handleAnswer(answers[index], correctAnswer, problemKey, generateMathProblem);
        });
    });
}

// --- Clock Game Logic ---

function initClockDial(ticksEl, numbersEl) {
    if (!ticksEl || !numbersEl) return;
    const svgNS = 'http://www.w3.org/2000/svg';

    for (let i = 0; i < 60; i++) {
        const angle = (i * 6 * Math.PI) / 180;
        const isHour = i % 5 === 0;
        const isMajor = i % 15 === 0;
        const outerR = 88;
        const innerR = isMajor ? 76 : isHour ? 79 : 83;

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', (100 + innerR * Math.sin(angle)).toFixed(2));
        line.setAttribute('y1', (100 - innerR * Math.cos(angle)).toFixed(2));
        line.setAttribute('x2', (100 + outerR * Math.sin(angle)).toFixed(2));
        line.setAttribute('y2', (100 - outerR * Math.cos(angle)).toFixed(2));
        line.setAttribute('class', isMajor ? 'clock-tick major' : isHour ? 'clock-tick hour' : 'clock-tick');
        ticksEl.appendChild(line);
    }

    for (let num = 1; num <= 12; num++) {
        const angle = (num * 30 * Math.PI) / 180;
        const r = 64;
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', (100 + r * Math.sin(angle)).toFixed(2));
        text.setAttribute('y', (100 - r * Math.cos(angle)).toFixed(2));
        text.setAttribute('class', 'clock-number');
        text.textContent = String(num);
        numbersEl.appendChild(text);
    }
}

function getAllowedMinutes() {
    if (currentState.difficulty === Difficulty.EASY) return [0, 30];
    if (currentState.difficulty === Difficulty.HARD) return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    return [0, 15, 30, 45];
}

function updateClockStyleUI() {
    const isDigital = currentState.clockStyle === 'digital';
    elements.clockStyleToggle.querySelectorAll('.clock-style-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.style === currentState.clockStyle);
    });
    elements.clockDisplay.classList.toggle('hidden', isDigital);
    elements.digitalClockDisplay.classList.toggle('hidden', !isDigital);
}

function createClockProblemData(use24Hour = false) {
    const allowedMinutes = getAllowedMinutes();
    const hour = use24Hour ? randomNumber(0, 23) : randomNumber(1, 12);
    const minute = allowedMinutes[randomNumber(0, allowedMinutes.length - 1)];
    return { hour, minute };
}

function generateClockProblem() {
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.clockHintBox.classList.add('hidden');
    elements.clockHintBox.textContent = '';

    updateClockStyleUI();
    const isDigital = currentState.clockStyle === 'digital';
    const generator = () => createClockProblemData(isDigital);

    let problem = pickMissedOrNew(GameMode.CLOCK, generator);
    let key = `${isDigital ? 'd' : 'a'}_${problem.hour}:${String(problem.minute).padStart(2, '0')}`;
    if (key === currentState.lastProblemKey) {
        problem = generator();
        key = `${isDigital ? 'd' : 'a'}_${problem.hour}:${String(problem.minute).padStart(2, '0')}`;
    }

    currentState.currentProblem = problem;
    currentState.lastProblemKey = key;

    if (isDigital) {
        renderDigitalClock(problem.hour, problem.minute);
    } else {
        renderClock(problem.hour, problem.minute);
    }
    setupClockButtons(problem.hour, problem.minute, key);
}

function renderDigitalClock(hour, minute) {
    elements.digitalTimeText.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function renderClockHands(hourHandEl, minuteHandEl, hour, minute) {
    const hourDegrees = ((hour % 12) * 30) + (minute * 0.5);
    const minuteDegrees = minute * 6;

    hourHandEl.setAttribute('transform', `rotate(${hourDegrees}, 100, 100)`);
    minuteHandEl.setAttribute('transform', `rotate(${minuteDegrees}, 100, 100)`);
}

function renderClock(hour, minute) {
    renderClockHands(elements.hourHand, elements.minuteHand, hour, minute);
}

function showClockHint() {
    const p = currentState.currentProblem;
    if (!p) return;

    const displayHour = p.hour % 12 === 0 ? 12 : p.hour % 12;
    const nextHour = (displayHour % 12) + 1;
    let tip = '';

    if (currentState.clockStyle === 'digital') {
        if (p.hour === 0) {
            tip = '00 på natten motsvarar 12. Titta sedan på minuterna!';
        } else if (p.hour >= 13) {
            tip = `På eftermiddagen/kvällen: ta bort 12 från ${p.hour} (${p.hour} − 12 = ${p.hour - 12}).`;
        } else {
            tip = `På förmiddagen är timmen samma som den digitala siffran (${p.hour}).`;
        }
    } else if (p.minute === 0) {
        tip = `Långa rosa visaren pekar rakt upp på 12 (hel timme). Korta lila visaren pekar på ${displayHour}.`;
    } else if (p.minute === 30) {
        tip = `Långa rosa visaren pekar rakt ner på 6 (halv). Korta visaren är på väg mot ${nextHour}.`;
    } else if (p.minute < 30) {
        tip = `Långa rosa visaren är på högra sidan ("över" ${displayHour}).`;
    } else {
        tip = `Långa rosa visaren är på vänstra sidan ("i" ${nextHour}).`;
    }

    elements.clockHintBox.textContent = tip;
    elements.clockHintBox.classList.remove('hidden');
}

function timeToSwedish(h, m) {
    let displayHour = h % 12;
    if (displayHour === 0) displayHour = 12;

    let nextHour = (h + 1) % 12;
    if (nextHour === 0) nextHour = 12;

    switch (m) {
        case 0: return `klockan ${displayHour}`;
        case 5: return `fem över ${displayHour}`;
        case 10: return `tio över ${displayHour}`;
        case 15: return `kvart över ${displayHour}`;
        case 20: return `tjugo över ${displayHour}`;
        case 25: return `fem i halv ${nextHour}`;
        case 30: return `halv ${nextHour}`;
        case 35: return `fem över halv ${nextHour}`;
        case 40: return `tjugo i ${nextHour}`;
        case 45: return `kvart i ${nextHour}`;
        case 50: return `tio i ${nextHour}`;
        case 55: return `fem i ${nextHour}`;
        default: return `${displayHour}:${String(m).padStart(2, '0')}`;
    }
}

function setupClockButtons(correctHour, correctMinute, problemKey) {
    const allowedMinutes = getAllowedMinutes();
    const correctString = timeToSwedish(correctHour, correctMinute);
    const answers = [correctString];

    while (answers.length < 4) {
        const h = randomNumber(1, 12);
        const m = allowedMinutes[randomNumber(0, allowedMinutes.length - 1)];
        const wrongString = timeToSwedish(h, m);

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
        btn.style.fontSize = '1.35em';

        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            elements.clockAnswers.querySelectorAll('.answer-btn').forEach((b) => (b.disabled = true));

            if (answers[index] === correctString) {
                newBtn.classList.add('correct');
            } else {
                newBtn.classList.add('wrong');
                elements.clockAnswers.querySelectorAll('.answer-btn').forEach((b, i) => {
                    if (answers[i] === correctString) b.classList.add('correct');
                });
            }
            handleAnswer(answers[index], correctString, problemKey, generateClockProblem);
        });
    });
}

// --- Set Clock Game Logic (Interactive) ---

function getMinuteStep() {
    if (currentState.difficulty === Difficulty.EASY) return 30;
    if (currentState.difficulty === Difficulty.HARD) return 5;
    return 15;
}

function setupSetClockListeners() {
    elements.hourDownBtn.addEventListener('click', () => stepSetClockHour(-1));
    elements.hourUpBtn.addEventListener('click', () => stepSetClockHour(1));
    elements.minDownBtn.addEventListener('click', () => stepSetClockMinute(-getMinuteStep()));
    elements.minUpBtn.addEventListener('click', () => stepSetClockMinute(getMinuteStep()));
    elements.checkClockBtn.addEventListener('click', checkSetClockAnswer);
    elements.setClockHintBtn.addEventListener('click', showSetClockHint);
    elements.setClockSpeakBtn.addEventListener('click', () => {
        const p = currentState.currentProblem;
        if (!p) return;
        speakText(`Ställ klockan på ${timeToSwedish(p.hour, p.minute)}`);
    });

    let isDragging = false;
    const handlePointer = (event) => {
        if (currentState.setClock.locked) return;
        const rect = elements.setClockSvg.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 200 - 100;
        const y = ((event.clientY - rect.top) / rect.height) * 200 - 100;
        const dist = Math.hypot(x, y);
        if (dist < 15) return;

        let deg = (Math.atan2(x, -y) * 180) / Math.PI;
        if (deg < 0) deg += 360;

        const step = getMinuteStep();
        const rawMin = Math.round(deg / 6) % 60;
        const snappedMin = (Math.round(rawMin / step) * step) % 60;
        currentState.setClock.minute = snappedMin;
        renderSetClock();
    };

    elements.setClockSvg.addEventListener('pointerdown', (e) => {
        if (currentState.setClock.locked) return;
        isDragging = true;
        elements.setClockSvg.setPointerCapture(e.pointerId);
        handlePointer(e);
    });

    elements.setClockSvg.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        handlePointer(e);
    });

    elements.setClockSvg.addEventListener('pointerup', () => {
        isDragging = false;
    });
    elements.setClockSvg.addEventListener('pointercancel', () => {
        isDragging = false;
    });
}

function generateSetClockProblem() {
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.setClockHintBox.classList.add('hidden');
    elements.setClockHintBox.textContent = '';

    const step = getMinuteStep();
    elements.minDownBtn.textContent = `− ${step} min`;
    elements.minUpBtn.textContent = `+ ${step} min`;

    let problem = pickMissedOrNew(GameMode.SET_CLOCK, createClockProblemData);
    let key = `${problem.hour}:${String(problem.minute).padStart(2, '0')}`;
    if (key === currentState.lastProblemKey) {
        problem = createClockProblemData();
        key = `${problem.hour}:${String(problem.minute).padStart(2, '0')}`;
    }

    currentState.currentProblem = problem;
    currentState.lastProblemKey = key;

    // Start the interactive clock at a different time so the child always moves the hands
    let startHour = ((problem.hour + 5) % 12) || 12;
    currentState.setClock = { hour: startHour, minute: 0, locked: false };

    elements.targetTimeText.textContent = timeToSwedish(problem.hour, problem.minute);
    elements.checkClockBtn.disabled = false;
    elements.checkClockBtn.className = 'check-clock-btn';
    renderSetClock();
}

function renderSetClock() {
    const { hour, minute } = currentState.setClock;
    renderClockHands(elements.setHourHand, elements.setMinuteHand, hour, minute);
}

function stepSetClockHour(delta) {
    if (currentState.setClock.locked) return;
    let h = ((currentState.setClock.hour - 1 + delta + 12) % 12) + 1;
    currentState.setClock.hour = h;
    renderSetClock();
}

function stepSetClockMinute(delta) {
    if (currentState.setClock.locked) return;
    let total = currentState.setClock.minute + delta;
    let hourShift = 0;

    if (total >= 60) {
        total -= 60;
        hourShift = 1;
    } else if (total < 0) {
        total += 60;
        hourShift = -1;
    }

    currentState.setClock.minute = total;
    if (hourShift !== 0) {
        currentState.setClock.hour = ((currentState.setClock.hour - 1 + hourShift + 12) % 12) + 1;
    }
    renderSetClock();
}

function showSetClockHint() {
    const p = currentState.currentProblem;
    if (!p) return;
    const digital = `${p.hour}:${String(p.minute).padStart(2, '0')}`;
    elements.setClockHintBox.textContent = `Tips: Korta lila visaren är timmar, långa rosa är minuter. Digital tid: ${digital}.`;
    elements.setClockHintBox.classList.remove('hidden');
}

function checkSetClockAnswer() {
    if (currentState.setClock.locked) return;
    currentState.setClock.locked = true;
    elements.checkClockBtn.disabled = true;

    const p = currentState.currentProblem;
    const selectedText = timeToSwedish(currentState.setClock.hour, currentState.setClock.minute);
    const correctText = timeToSwedish(p.hour, p.minute);
    const key = currentState.lastProblemKey;

    if (selectedText === correctText) {
        elements.checkClockBtn.classList.add('correct');
    } else {
        elements.checkClockBtn.classList.add('wrong');
        // Show the correct hand position briefly so the child sees the right answer
        renderClockHands(elements.setHourHand, elements.setMinuteHand, p.hour, p.minute);
    }

    handleAnswer(selectedText, correctText, key, generateSetClockProblem);
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
