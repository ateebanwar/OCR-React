/**
 * Decimal-safe arithmetic and financial formatting utilities.
 * Avoids IEEE-754 floating-point drift (e.g., 0.1 + 0.2 = 0.30000000000000004).
 */

export interface DecimalValue {
  raw: string | null | undefined;
  normalized: number | null;
  formatted: string;
  currency?: string;
  precision: number;
  isNegative: boolean;
  isZero: boolean;
  isMissing: boolean;
}

const MULTIPLIER_FACTOR = 10000; // 4 decimal places internal precision scaling

export class Decimal {
  /**
   * Parses an input string or number into a scaled integer representation.
   * Preserves null/undefined without converting to 0.
   */
  public static parse(val: string | number | null | undefined, currency?: string): DecimalValue {
    if (val === null || val === undefined || val === '') {
      return {
        raw: val ?? null,
        normalized: null,
        formatted: '—',
        currency,
        precision: 2,
        isNegative: false,
        isZero: false,
        isMissing: true,
      };
    }

    if (typeof val === 'number') {
      const isNegative = val < 0;
      const isZero = val === 0;
      return {
        raw: String(val),
        normalized: val,
        formatted: Decimal.format(val, currency, 2),
        currency,
        precision: 2,
        isNegative,
        isZero,
        isMissing: false,
      };
    }

    // Clean string: remove commas, spaces, currency symbols like $, €, £, ₹
    const cleaned = val.replace(/[,\s$€£₹]/g, '').trim();
    // Handle accounting parenthetical negative: (100.50) -> -100.50
    const isParenthetical = /^\((.*)\)$/.test(cleaned);
    const numericStr = isParenthetical ? `-${cleaned.replace(/[()]/g, '')}` : cleaned;

    const num = parseFloat(numericStr);
    if (isNaN(num)) {
      return {
        raw: val,
        normalized: null,
        formatted: val,
        currency,
        precision: 2,
        isNegative: false,
        isZero: false,
        isMissing: false,
      };
    }

    const precision = (numericStr.split('.')[1] || '').length || 2;
    const isNegative = num < 0;
    const isZero = num === 0;

    return {
      raw: val,
      normalized: num,
      formatted: Decimal.format(num, currency, Math.min(precision, 4)),
      currency,
      precision,
      isNegative,
      isZero,
      isMissing: false,
    };
  }

  /**
   * Safe addition of two numbers avoiding floating point inaccuracy.
   */
  public static add(a: number, b: number): number {
    const scaledA = Math.round(a * MULTIPLIER_FACTOR);
    const scaledB = Math.round(b * MULTIPLIER_FACTOR);
    return (scaledA + scaledB) / MULTIPLIER_FACTOR;
  }

  /**
   * Safe subtraction: a - b.
   */
  public static subtract(a: number, b: number): number {
    const scaledA = Math.round(a * MULTIPLIER_FACTOR);
    const scaledB = Math.round(b * MULTIPLIER_FACTOR);
    return (scaledA - scaledB) / MULTIPLIER_FACTOR;
  }

  /**
   * Safe sum of an array of numbers. Null/undefined are skipped, NOT converted to 0.
   */
  public static sum(values: (number | null | undefined)[]): number | null {
    const valid = values.filter((v): v is number => typeof v === 'number' && !isNaN(v));
    if (valid.length === 0) return null;
    return valid.reduce((acc, curr) => Decimal.add(acc, curr), 0);
  }

  /**
   * Compares two numbers with a microscopic epsilon for reconciliation.
   */
  public static equals(a: number | null, b: number | null, epsilon: number = 0.001): boolean {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return Math.abs(a - b) <= epsilon;
  }

  /**
   * Formats a monetary number with locale formatting and proper currency symbol.
   */
  public static format(val: number | null | undefined, currency?: string, decimals: number = 2): string {
    if (val === null || val === undefined) return '—';

    const abs = Math.abs(val);
    const formattedNum = abs.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const currPrefix = currency ? `${currency} ` : '';
    return val < 0 ? `(${currPrefix}${formattedNum})` : `${currPrefix}${formattedNum}`;
  }
}
