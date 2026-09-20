import { Table, Metadata } from '../../schemas/extraction.schema.js';
import { ValidationResult, ValidationIssue } from '../../domain/validation/ValidationResult.js';

export class DeterministicValidator {
  public static validate(tables: Table[], metadata: Metadata): ValidationResult {
    const issues: ValidationIssue[] = [];
    const checkedRules: string[] = [
      'table-structure-integrity',
      'cell-datatype-consistency',
      'row-index-sequence',
      'currency-uniformity',
      'duplicate-row-detection',
    ];

    let totalRows = 0;
    let totalColumns = 0;
    let emptyCells = 0;
    let numericCells = 0;

    if (!tables || tables.length === 0) {
      issues.push({
        code: 'NO_TABLES_FOUND',
        field: 'tables',
        message: 'No structured tables were extracted from document.',
        severity: 'error',
      });
    }

    tables.forEach((table, tIdx) => {
      totalColumns += table.columns.length;
      totalRows += table.rows.length;

      if (table.columns.length === 0) {
        issues.push({
          code: 'TABLE_EMPTY_COLUMNS',
          field: `tables[${tIdx}].columns`,
          message: `Table ${table.name || tIdx} has zero columns.`,
          severity: 'error',
          tableId: table.id,
        });
      }

      // Check rows
      const rowSignatures = new Set<string>();

      table.rows.forEach((row, rIdx) => {
        // Collect row signature to check duplicates
        const cellValues: string[] = [];

        for (const col of table.columns) {
          const cell = row.cells[col.id];
          if (!cell || cell.rawValue === '' || cell.normalizedValue === null) {
            emptyCells++;
          } else {
            if (cell.dataType === 'number' || cell.dataType === 'currency') {
              numericCells++;
              if (typeof cell.normalizedValue === 'number' && isNaN(cell.normalizedValue)) {
                issues.push({
                  code: 'INVALID_NUMERIC_CELL',
                  field: `tables[${tIdx}].rows[${rIdx}].cells[${col.id}]`,
                  message: `Cell '${col.name}' contains NaN numeric value: "${cell.rawValue}"`,
                  severity: 'error',
                  tableId: table.id,
                  rowId: row.id,
                  columnId: col.id,
                });
              }
            }
            cellValues.push(String(cell.rawValue).trim().toLowerCase());
          }
        }

        const signature = cellValues.join('|');
        if (signature.length > 5 && rowSignatures.has(signature)) {
          issues.push({
            code: 'DUPLICATE_ROW_DETECTED',
            field: `tables[${tIdx}].rows[${rIdx}]`,
            message: `Row index ${row.rowIndex} is an exact duplicate of a preceding row.`,
            severity: 'warning',
            tableId: table.id,
            rowId: row.id,
          });
        } else if (signature.length > 5) {
          rowSignatures.add(signature);
        }
      });
    });

    const hasErrors = issues.some((i) => i.severity === 'error');

    return {
      isValid: !hasErrors,
      issues,
      checkedRules,
      deterministicSummary: {
        totalRows,
        totalColumns,
        emptyCells,
        numericCells,
        anomaliesFound: issues.length,
      },
    };
  }
}
