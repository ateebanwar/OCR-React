import { ExtractedTable } from '@/domain/extraction/ExtractionResult';
import { ValidationResult, ValidationIssue, ReconciliationResult, ReconciliationCheck } from '@/domain/validation/ValidationResult';
import { Decimal } from '@/core/utils/decimal';

export class ValidateAndReconcileUseCase {
  public static execute(
    table: ExtractedTable,
    currency: string = 'USD'
  ): { validation: ValidationResult; reconciliation: ReconciliationResult } {
    const issues: ValidationIssue[] = [];
    const checks: ReconciliationCheck[] = [];

    // 1. Identify numeric columns
    const numericColumns = new Set<string>();
    for (const header of table.headers) {
      const isNumericHeader = /amount|cost|price|total|expend|allocat|rate|debit|credit|balance|q[1-4]|202/i.test(header);
      if (isNumericHeader) {
        numericColumns.add(header);
      }
    }

    // Check each numeric cell for decimal consistency and negative format
    table.rows.forEach((row, rIdx) => {
      for (const colKey of numericColumns) {
        const cell = row.cells[colKey];
        if (!cell || cell.rawValue === null || cell.rawValue === undefined || cell.rawValue === '—') {
          continue; // Missing values are valid, preserved as null
        }

        const parsed = Decimal.parse(cell.rawValue, currency);
        if (parsed.normalized === null && cell.rawValue.trim() !== '') {
          issues.push({
            id: `issue-num-${rIdx}-${colKey}`,
            category: 'DECIMAL_ACCURACY',
            severity: 'error',
            message: `Invalid numeric value "${cell.rawValue}" in column "${colKey}"`,
            explanation: `The value could not be parsed into a deterministic decimal representation.`,
            rowIndex: rIdx,
            columnKey: colKey,
            sourceContext: {
              pageNumber: cell.pageNumber,
              extractedValue: cell.rawValue,
            },
          });
        }
      }
    });

    // 3. Subtotal Arithmetic Reconciliation
    // Compare line items leading up to a Total/Subtotal row
    let accumulatedSums: Record<string, number> = {};
    let lastSubtotalIndex = -1;

    table.rows.forEach((row, rIdx) => {
      const firstCellText = Object.values(row.cells)[0]?.rawValue?.toLowerCase() || '';
      const isTotalRow = firstCellText.includes('total') || firstCellText.includes('subtotal');

      if (!isTotalRow) {
        // Accumulate values
        for (const colKey of numericColumns) {
          const raw = row.cells[colKey]?.rawValue;
          const parsed = Decimal.parse(raw, currency);
          if (parsed.normalized !== null) {
            accumulatedSums[colKey] = Decimal.add(accumulatedSums[colKey] || 0, parsed.normalized);
          }
        }
      } else {
        // Subtotal row reached - reconcile!
        for (const colKey of numericColumns) {
          const statedRaw = row.cells[colKey]?.rawValue;
          const statedParsed = Decimal.parse(statedRaw, currency);

          if (statedParsed.normalized !== null) {
            const calculatedSum = accumulatedSums[colKey] ?? 0;
            const variance = Decimal.subtract(statedParsed.normalized, calculatedSum);
            const isMatch = Decimal.equals(statedParsed.normalized, calculatedSum);

            checks.push({
              id: `recon-check-${rIdx}-${colKey}`,
              name: `Reconciliation: ${firstCellText.toUpperCase()} [${colKey}]`,
              description: `Verification of line items between rows ${lastSubtotalIndex + 2} and ${rIdx}`,
              status: isMatch ? 'passed' : 'failed',
              expectedAmount: statedParsed.normalized,
              calculatedAmount: calculatedSum,
              variance: Math.abs(variance),
              currency,
              formulaDescription: `Calculated sum (${calculatedSum.toLocaleString()}) vs Stated row total (${statedParsed.normalized.toLocaleString()})`,
            });

            if (!isMatch) {
              issues.push({
                id: `issue-subtotal-${rIdx}-${colKey}`,
                category: 'ARITHMETIC_SUBTOTAL_MISMATCH',
                severity: 'warning',
                message: `Subtotal discrepancy in column "${colKey}": calculated ${calculatedSum.toLocaleString()} vs stated ${statedParsed.normalized.toLocaleString()}`,
                explanation: `Sum of line items differs from the printed total by ${Math.abs(variance).toLocaleString()} ${currency}.`,
                rowIndex: rIdx,
                columnKey: colKey,
                sourceContext: {
                  pageNumber: row.pageNumber,
                  expectedValue: calculatedSum,
                  foundValue: statedParsed.normalized,
                },
              });
            }
          }
        }

        // Reset accumulator after subtotal
        accumulatedSums = {};
        lastSubtotalIndex = rIdx;
      }
    });

    const totalErrors = issues.filter((i) => i.severity === 'error').length;
    const totalWarnings = issues.filter((i) => i.severity === 'warning').length;
    const totalVariance = checks.reduce((sum, c) => Decimal.add(sum, c.variance), 0);

    return {
      validation: {
        isValid: totalErrors === 0,
        hasWarnings: totalWarnings > 0,
        totalErrors,
        totalWarnings,
        issues,
        validatedAt: new Date().toISOString(),
      },
      reconciliation: {
        isReconciled: checks.every((c) => c.status === 'passed'),
        checks,
        totalVariance,
        reconciledAt: new Date().toISOString(),
      },
    };
  }
}
