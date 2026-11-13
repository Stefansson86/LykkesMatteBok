import { MathProblem, GameMode } from '../types/game';

const EASY_TABLES = [2, 3, 4, 5, 10, 2, 3, 4, 5, 1];

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildOptions(answer: number, candidates: number[]): number[] {
  const options = new Set<number>([answer]);

  for (const candidate of candidates) {
    if (options.size >= 4) break;
    if (candidate >= 0 && candidate !== answer) {
      options.add(candidate);
    }
  }

  let attempts = 0;
  while (options.size < 4 && attempts < 50) {
    attempts++;
    const offset = randomInt(1, 6);
    const candidate = Math.random() < 0.5 ? answer + offset : answer - offset;
    if (candidate >= 0) {
      options.add(candidate);
    }
  }

  // Fallback if answer is very small
  let fallback = 0;
  while (options.size < 4) {
    if (!options.has(fallback)) {
      options.add(fallback);
    }
    fallback++;
  }

  return shuffleArray(Array.from(options));
}

export function generateTenCrossingAddition(): MathProblem {
  const tens = randomInt(0, 5) * 10; // 0..50 so sums are up to ~68, very kid-friendly
  const ones = randomInt(2, 9);
  const a = tens + ones; // 2..59, never ending in 0 or 1
  const b = randomInt(11 - ones, 9); // guarantees (a % 10) + b >= 11
  const answer = a + b;

  const toTen = 10 - ones;
  const tenValue = a + toTen;
  const remainder = b - toTen;

  const candidates = shuffleArray([
    answer - 1,
    answer + 1,
    answer - 2,
    answer + 2,
    answer - 10, // common ten-crossing mistake: forgot to carry the ten
    answer + 10,
  ]);

  return {
    id: makeId(),
    operation: 'ADD',
    a,
    b,
    answer,
    equation: `${a} + ${b}`,
    label: 'HOPPA ÖVER TIOTALET!',
    options: buildOptions(answer, candidates),
    hint: {
      kind: 'ten-bridge',
      start: a,
      operator: '+',
      toTen,
      tenValue,
      remainder,
      result: answer,
    },
  };
}

export function generateTenCrossingSubtraction(): MathProblem {
  const tens = randomInt(1, 5) * 10; // 10..50 -> a is 11..58
  const ones = randomInt(1, 8);
  const a = tens + ones;
  const b = randomInt(ones + 1, 9); // guarantees crossing down past the ten
  const answer = a - b;

  const toTen = ones;
  const tenValue = a - toTen;
  const remainder = b - toTen;

  const candidates = shuffleArray([
    answer - 1,
    answer + 1,
    answer - 2,
    answer + 2,
    answer + 10, // common mistake: forgot to borrow
  ]);

  return {
    id: makeId(),
    operation: 'SUB',
    a,
    b,
    answer,
    equation: `${a} - ${b}`,
    label: 'HOPPA NER FÖRBI TIOTALET!',
    options: buildOptions(answer, candidates),
    hint: {
      kind: 'ten-bridge',
      start: a,
      operator: '-',
      toTen,
      tenValue,
      remainder,
      result: answer,
    },
  };
}

export function generateEasyMultiplication(): MathProblem {
  const table = EASY_TABLES[randomInt(0, EASY_TABLES.length - 1)];
  const other = randomInt(1, 10);
  const swap = Math.random() < 0.5;
  const a = swap ? other : table;
  const b = swap ? table : other;
  const answer = a * b;

  const groups = Math.min(a, b);
  const perGroup = Math.max(a, b);

  const candidates = shuffleArray([
    answer + Math.min(a, b),
    answer - Math.min(a, b),
    a + b, // common mistake: adding instead of multiplying
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
  ]);

  return {
    id: makeId(),
    operation: 'MUL',
    a,
    b,
    answer,
    equation: `${a} × ${b}`,
    label: 'HUR MÅNGA BLIR DET?',
    options: buildOptions(answer, candidates),
    hint: {
      kind: 'groups',
      groups,
      perGroup,
      result: answer,
    },
  };
}

export function generateMathProblem(mode: Exclude<GameMode, 'MENU' | 'CLOCK'>): MathProblem {
  if (mode === 'TEN_CROSSING') {
    return Math.random() < 0.5
      ? generateTenCrossingAddition()
      : generateTenCrossingSubtraction();
  }

  if (mode === 'MULTIPLY') {
    return generateEasyMultiplication();
  }

  // MIX mode: equal blend of ten-crossing addition, ten-crossing subtraction, and easy multiplication
  const roll = Math.random();
  if (roll < 0.34) return generateTenCrossingAddition();
  if (roll < 0.67) return generateTenCrossingSubtraction();
  return generateEasyMultiplication();
}
