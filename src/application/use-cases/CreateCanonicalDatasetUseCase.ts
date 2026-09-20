import { ExtractedTable } from '@/domain/extraction/ExtractionResult';
import { ValidationResult, ReconciliationResult } from '@/domain/validation/ValidationResult';
import {
  CanonicalDataset,
  DatasetColumn,
  DatasetRow,
  DatasetCell,
  ColumnDataType,
} from '@/domain/dataset/CanonicalDataset';
import { Decimal } from '@/core/utils/decimal';

export class CreateCanonicalDatasetUseCase {
  public static execute(params: {
    documentId: string;
    table: ExtractedTable;
    currency: string;
    validation: ValidationResult;
    reconciliation: ReconciliationResult;
    modelUsed: string;
    processingTimeMs: number;
  }): CanonicalDataset {
    const { documentId, table, currency, validation, reconciliation, modelUsed, processingTimeMs } = params;

    // Build columns
    const columns: DatasetColumn[] = table.headers.map((header) => {
      const isNumeric = /amount|cost|price|total|expend|allocat|rate|debit|credit|balance|q[1-4]|202/i.test(header);
      const isPercentage = /%|growth|percent|margin/i.test(header);
      const isDate = /date|period|time/i.test(header);

      let dataType: ColumnDataType = 'string';
      if (isPercentage) dataType = 'percentage';
      else if (isNumeric) dataType = 'currency';
      else if (isDate) dataType = 'date';

      return {
        key: header,
        name: header,
        dataType,
        currency: dataType === 'currency' ? currency : undefined,
        isNumeric,
        precision: 2,
        widthChars: Math.max(header.length + 4, 16),
      };
    });

    // Build rows
    const rows: DatasetRow[] = table.rows.map((extractedRow, rIdx) => {
      const firstCellVal = Object.values(extractedRow.cells)[0]?.rawValue?.toLowerCase() || '';
      const isTotal = firstCellVal.includes('total') && !firstCellVal.includes('subtotal');
      const isSubtotal = firstCellVal.includes('subtotal');

      const cells: Record<string, DatasetCell> = {};

      columns.forEach((col, cIdx) => {
        const extCell = extractedRow.cells[col.key];
        const raw = extCell?.rawValue ?? null;
        const parsed = Decimal.parse(raw, col.currency);

        const hasCellError = validation.issues.some(
          (i) => i.rowIndex === rIdx && (i.columnKey === col.key || !i.columnKey)
        );

        cells[col.key] = {
          columnKey: col.key,
          rawValue: raw,
          normalizedValue: parsed.normalized,
          displayValue: parsed.formatted,
          currency: col.currency,
          isNumeric: col.isNumeric,
          isValid: !hasCellError,
          hasWarning: hasCellError,
          sourceReference: {
            pageNumber: extCell?.pageNumber ?? extractedRow.pageNumber,
            rowIndex: rIdx,
            columnIndex: cIdx,
          },
        };
      });

      return {
        rowId: `row-${rIdx}`,
        rowNumber: rIdx + 1,
        isHeader: false,
        isSubtotal,
        isTotal,
        cells,
        pageNumber: extractedRow.pageNumber,
      };
    });

    // Compute column totals
    const numericSums: Record<string, number | null> = {};
    columns.forEach((col) => {
      if (col.isNumeric) {
        const values = rows
          .filter((r) => !r.isTotal && !r.isSubtotal)
          .map((r) => r.cells[col.key]?.normalizedValue as number | null | undefined);
        numericSums[col.key] = Decimal.sum(values);
      }
    });

    return {
      id: `canonical-${documentId}-${table.id}`,
      documentId,
      title: table.title,
      createdAt: new Date().toISOString(),
      columns,
      rows,
      totals: {
        rowCount: rows.length,
        columnCount: columns.length,
        numericSums,
        currencyDetected: currency,
      },
      validation,
      reconciliation,
      auditTrail: {
        modelUsed,
        processingTimeMs,
        stagesCompleted: [
          'Ingestion',
          'Layout Analysis',
          'Table Extraction',
          'Schema Validation',
          'Decimal Normalization',
          'Deterministic Subtotal Reconciliation',
          'Canonical Dataset Creation',
        ],
        schemaVersion: '2.0.0-canonical',
      },
    };
  }
}
