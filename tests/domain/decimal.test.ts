import { describe, it, expect } from 'vitest';
import { Decimal } from '@/core/utils/decimal';

describe('Decimal-Safe Financial Arithmetic Engine', () => {
  it('eliminates IEEE-754 floating point drift for addition (0.1 + 0.2 = 0.3)', () => {
    // Normal JS: 0.1 + 0.2 === 0.30000000000000004
    const result = Decimal.add(0.1, 0.2);
    expect(result).toBe(0.3);
  });

  it('safely subtracts decimal values without floating drift', () => {
    const result = Decimal.subtract(100.55, 50.25);
    expect(result).toBe(50.3);
  });

  it('correctly parses accounting parenthetical negative numbers (e.g., (15,000.00))', () => {
    const parsed = Decimal.parse('(15,000.00)', 'USD');
    expect(parsed.normalized).toBe(-15000);
    expect(parsed.isNegative).toBe(true);
    expect(parsed.isZero).toBe(false);
    expect(parsed.isMissing).toBe(false);
  });

  it('preserves null and undefined as missing, never coercing to zero', () => {
    const parsedNull = Decimal.parse(null);
    expect(parsedNull.normalized).toBeNull();
    expect(parsedNull.isMissing).toBe(true);
    expect(parsedNull.isZero).toBe(false);

    const parsedEmpty = Decimal.parse('');
    expect(parsedEmpty.normalized).toBeNull();
    expect(parsedEmpty.isMissing).toBe(true);
  });

  it('distinguishes explicit zero from missing values', () => {
    const parsedZero = Decimal.parse('0.00');
    expect(parsedZero.normalized).toBe(0);
    expect(parsedZero.isZero).toBe(true);
    expect(parsedZero.isMissing).toBe(false);
  });

  it('handles Indian Rupee ₹, Euro €, and Dollar $ formatted strings', () => {
    const parsedInr = Decimal.parse('₹ 1,250,000.00', 'INR');
    expect(parsedInr.normalized).toBe(1250000);

    const parsedEur = Decimal.parse('€ 14,880.50', 'EUR');
    expect(parsedEur.normalized).toBe(14880.5);

    const parsedUsd = Decimal.parse('$ 985.00', 'USD');
    expect(parsedUsd.normalized).toBe(985);
  });

  it('computes safe sum across array of numbers skipping nulls', () => {
    const values = [100.25, null, 200.5, undefined, 50.25];
    const sum = Decimal.sum(values);
    expect(sum).toBe(351);
  });

  it('returns null when summing array of all nulls without defaulting to 0', () => {
    const values = [null, null, undefined];
    const sum = Decimal.sum(values);
    expect(sum).toBeNull();
  });
});
