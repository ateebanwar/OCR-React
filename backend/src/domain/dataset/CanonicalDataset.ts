import { Table, Metadata } from '../../schemas/extraction.schema.js';

export interface CalculatedTotals {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  rowCount: number;
  columnCount: number;
}

export interface CanonicalDataset {
  id: string;
  documentId: string;
  processingId: string;
  createdAt: string;
  metadata: Metadata;
  tables: Table[];
  totals: CalculatedTotals;
  summary?: string;
  validationStatus: 'passed' | 'warning' | 'failed';
  reconciliationStatus: 'passed' | 'warning' | 'failed';
}
