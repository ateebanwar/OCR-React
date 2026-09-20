export interface SpreadsheetChecksum {
  canonicalRowCount: number;
  workbookRowCount: number;
  canonicalColumnCount: number;
  workbookColumnCount: number;
  checkedTotalsMatch: boolean;
  mismatchedCellsCount: number;
}

export interface GeneratedSpreadsheet {
  id: string;
  documentId: string;
  filename: string;
  byteLength: number;
  mimeType: string;
  blob: Blob;
  generatedAt: string;
  isVerified: boolean;
  checksums: SpreadsheetChecksum;
}
