export type GameMode = 'MENU' | 'TEN_CROSSING' | 'MULTIPLY' | 'MIX' | 'CLOCK';

export type MathOperation = 'ADD' | 'SUB' | 'MUL';

export interface TenCrossingHint {
  kind: 'ten-bridge';
  start: number;
  operator: '+' | '-';
  toTen: number;
  tenValue: number;
  remainder: number;
  result: number;
}

export interface MultiplyHint {
  kind: 'groups';
  groups: number;
  perGroup: number;
  result: number;
}

export type MathHint = TenCrossingHint | MultiplyHint;

export interface MathProblem {
  id: string;
  operation: MathOperation;
  a: number;
  b: number;
  answer: number;
  equation: string;
  label: string;
  options: number[];
  hint: MathHint;
}

export interface ClockProblem {
  id: string;
  hour: number;
  minute: number;
  answer: string;
  options: string[];
}

export type BestStreaks = Record<Exclude<GameMode, 'MENU'>, number>;

export type MascotMood = 'idle' | 'happy' | 'excited' | 'oops';
