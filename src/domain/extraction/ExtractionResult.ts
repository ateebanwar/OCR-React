export type ExtractionConfidence = 'high' | 'medium' | 'low';

export interface ExtractedCell {
  rowIndex: number;
  columnIndex: number;
  columnKey: string;
  rawValue: string | null | undefined;
  confidence: number; // 0.0 - 1.0
  pageNumber: number;
  bbox?: [number, number, number, number];
}

export interface ExtractedRow {
  rowIndex: number;
  cells: Record<string, ExtractedCell>;
  pageNumber: number;
}

export interface ExtractedTable {
  id: string;
  title: string;
  headers: string[];
  rows: ExtractedRow[];
  pageNumber: number;
  confidence: number;
}

export interface ExtractedField {
  key: string;
  label: string;
  rawValue: string | null | undefined;
  confidence: number;
  pageNumber: number;
}

export interface ExtractionResult {
  documentId: string;
  extractedAt: string;
  modelName: string;
  overallConfidence: number;
  fields: ExtractedField[];
  tables: ExtractedTable[];
}
