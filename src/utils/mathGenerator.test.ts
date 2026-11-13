import { describe, it, expect } from 'vitest';
import {
  generateTenCrossingAddition,
  generateTenCrossingSubtraction,
  generateEasyMultiplication,
  generateMathProblem,
} from './mathGenerator';

describe('mathGenerator', () => {
  it('generates ten-crossing addition problems that always cross a ten', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateTenCrossingAddition();
      expect(problem.operation).toBe('ADD');
      expect(problem.answer).toBe(problem.a + problem.b);
      expect(problem.b).toBeGreaterThanOrEqual(2);
      expect(problem.b).toBeLessThanOrEqual(9);
      // Must strictly cross to the next ten
      expect(Math.floor(problem.answer / 10)).toBeGreaterThan(Math.floor(problem.a / 10));

      // Options validation
      expect(problem.options).toHaveLength(4);
      expect(new Set(problem.options).size).toBe(4);
      expect(problem.options).toContain(problem.answer);
      problem.options.forEach((opt) => expect(opt).toBeGreaterThanOrEqual(0));

      // Hint validation
      expect(problem.hint.kind).toBe('ten-bridge');
      if (problem.hint.kind === 'ten-bridge') {
        expect(problem.hint.tenValue % 10).toBe(0);
        expect(problem.hint.start + problem.hint.toTen).toBe(problem.hint.tenValue);
        expect(problem.hint.tenValue + problem.hint.remainder).toBe(problem.answer);
      }
    }
  });

  it('generates ten-crossing subtraction problems that always cross down past a ten', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateTenCrossingSubtraction();
      expect(problem.operation).toBe('SUB');
      expect(problem.answer).toBe(problem.a - problem.b);
      expect(problem.answer).toBeGreaterThanOrEqual(1);
      expect(problem.b).toBeGreaterThanOrEqual(2);
      expect(problem.b).toBeLessThanOrEqual(9);
      // Must strictly cross down to the previous ten
      expect(Math.floor(problem.answer / 10)).toBeLessThan(Math.floor(problem.a / 10));

      // Options validation
      expect(problem.options).toHaveLength(4);
      expect(new Set(problem.options).size).toBe(4);
      expect(problem.options).toContain(problem.answer);
      problem.options.forEach((opt) => expect(opt).toBeGreaterThanOrEqual(0));

      // Hint validation
      expect(problem.hint.kind).toBe('ten-bridge');
      if (problem.hint.kind === 'ten-bridge') {
        expect(problem.hint.tenValue % 10).toBe(0);
        expect(problem.hint.start - problem.hint.toTen).toBe(problem.hint.tenValue);
        expect(problem.hint.tenValue - problem.hint.remainder).toBe(problem.answer);
      }
    }
  });

  it('generates easy multiplication problems using tables 1, 2, 3, 4, 5, 10', () => {
    const allowedTables = new Set([1, 2, 3, 4, 5, 10]);
    for (let i = 0; i < 100; i++) {
      const problem = generateEasyMultiplication();
      expect(problem.operation).toBe('MUL');
      expect(problem.answer).toBe(problem.a * problem.b);
      expect(allowedTables.has(problem.a) || allowedTables.has(problem.b)).toBe(true);
      expect(problem.a).toBeGreaterThanOrEqual(1);
      expect(problem.b).toBeGreaterThanOrEqual(1);
      expect(problem.a).toBeLessThanOrEqual(10);
      expect(problem.b).toBeLessThanOrEqual(10);

      expect(problem.options).toHaveLength(4);
      expect(new Set(problem.options).size).toBe(4);
      expect(problem.options).toContain(problem.answer);
    }
  });

  it('generates problems for all math modes', () => {
    expect(['ADD', 'SUB']).toContain(generateMathProblem('TEN_CROSSING').operation);
    expect(generateMathProblem('MULTIPLY').operation).toBe('MUL');
    expect(['ADD', 'SUB', 'MUL']).toContain(generateMathProblem('MIX').operation);
  });
});
