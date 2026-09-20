import { describe, it, expect } from 'vitest';
import { SafeDecimal, sumDecimals } from '../src/utils/decimal.js';

describe('SafeDecimal Financial Arithmetic', () => {
  it('correctly handles classic 0.1 + 0.2 floating point drift', () => {
    // Normal float: 0.1 + 0.2 === 0.30000000000000004
    const res = SafeDecimal.from(0.1).add(0.2);
    expect(res.toNumber()).toBe(0.3);
    expect(res.toFixed(2)).toBe('0.30');
  });

  it('correctly sums multiple line item values', () => {
    const values = [12.99, 45.50, 0.01, 100.00, 299.99];
    const total = sumDecimals(values);
    expect(total).toBe(458.49);
  });

  it('computes percentage adjustments and multiplications safely', () => {
    const amount = SafeDecimal.from(100.00);
    const tax = amount.multiply(0.0825);
    expect(tax.toNumber()).toBeCloseTo(8.25, 2);
  });

  it('supports subtract and tolerance checks', () => {
    const a = SafeDecimal.from('1500.55');
    const b = SafeDecimal.from('500.25');
    const diff = a.subtract(b);
    expect(diff.toNumber()).toBe(1000.30);
    expect(diff.equals(1000.30)).toBe(true);
  });
});
