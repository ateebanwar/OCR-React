import { ValidationResult, ReconciliationResult } from '../validation/ValidationResult';

export type ColumnDataType = 'string' | 'number' | 'currency' | 'date' | 'percentage';

export interface DatasetColumn {
  key: string;
  name: string;
  dataType: ColumnDataType;
  currency?: string;
  isNumeric: boolean;
  precision: number;
  widthChars?: number;
}

export interface DatasetCell {
  columnKey: string;
  rawValue: string | null | undefined;
  normalizedValue: string | number | null;
  displayValue: string;
  currency?: string;
  isNumeric: boolean;
  isValid: boolean;
  hasWarning: boolean;
  sourceReference: {
    pageNumber: number;
    rowIndex: number;
    columnIndex: number;
    bbox?: [number, number, number, number];
  };
}

export interface DatasetRow {
  rowId: string;
  rowNumber: number;
  isHeader?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  cells: Record<string, DatasetCell>;
  pageNumber: number;
}

export interface DatasetTotals {
  rowCount: number;
  columnCount: number;
  numericSums: Record<string, number | null>;
  currencyDetected: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CanonicalDataset {
  id: string;
  documentId: string;
  title: string;
  createdAt: string;
  columns: DatasetColumn[];
  rows: DatasetRow[];
  totals: DatasetTotals;
  validation: ValidationResult;
  reconciliation: ReconciliationResult;
  auditTrail: {
    modelUsed: string;
    processingTimeMs: number;
    stagesCompleted: string[];
    schemaVersion: string;
  };
}
