/**
 * Safe Decimal calculation utility for financial amounts.
 * Prevents IEEE-754 precision issues (e.g. 0.1 + 0.2 !== 0.3)
 * using scaled integer arithmetic (scaled to 10^4).
 */
export class SafeDecimal {
  private static readonly SCALE = 10000;

  private readonly valueInUnits: bigint;

  constructor(amount: number | string | bigint) {
    if (typeof amount === 'bigint') {
      this.valueInUnits = amount;
    } else {
      const clean = typeof amount === 'number' ? amount.toFixed(4) : String(amount).replace(/[^0-9.-]/g, '');
      const num = parseFloat(clean);
      if (isNaN(num)) {
        this.valueInUnits = BigInt(0);
      } else {
        this.valueInUnits = BigInt(Math.round(num * SafeDecimal.SCALE));
      }
    }
  }

  public static from(amount: number | string): SafeDecimal {
    return new SafeDecimal(amount);
  }

  public add(other: SafeDecimal | number | string): SafeDecimal {
    const o = other instanceof SafeDecimal ? other : new SafeDecimal(other);
    return new SafeDecimal(this.valueInUnits + o.valueInUnits);
  }

  public subtract(other: SafeDecimal | number | string): SafeDecimal {
    const o = other instanceof SafeDecimal ? other : new SafeDecimal(other);
    return new SafeDecimal(this.valueInUnits - o.valueInUnits);
  }

  public multiply(factor: number): SafeDecimal {
    const scaledFactor = BigInt(Math.round(factor * 1000000));
    const result = (this.valueInUnits * scaledFactor) / BigInt(1000000);
    return new SafeDecimal(result);
  }

  public toNumber(): number {
    return Number(this.valueInUnits) / SafeDecimal.SCALE;
  }

  public toFixed(decimals: number = 2): string {
    return this.toNumber().toFixed(decimals);
  }

  public equals(other: SafeDecimal | number | string, tolerance: number = 0.01): boolean {
    const o = other instanceof SafeDecimal ? other : new SafeDecimal(other);
    return Math.abs(this.toNumber() - o.toNumber()) <= tolerance;
  }
}

export function sumDecimals(amounts: (number | string)[]): number {
  return amounts.reduce<SafeDecimal>((acc, cur) => acc.add(cur), new SafeDecimal(0)).toNumber();
}
