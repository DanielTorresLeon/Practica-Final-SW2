import { describe, expect, it } from 'vitest';

// Función simple para probar
const sum = (a, b) => a + b;

describe('sum function', () => {
  it('should add two numbers correctly', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('should return 0 when adding 0 + 0', () => {
    expect(sum(0, 0)).toBe(0);
  });
});

