export type DocumentStatus =
  | 'idle'
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'extracting'
  | 'validating'
  | 'reconciling'
  | 'ready'
  | 'failed'
  | 'cancelled';

export interface DocumentMetadata {
  filename: string;
  sizeBytes: number;
  mimeType: string;
  pageCount: number;
  isScanned: boolean;
  uploadedAt: string;
  detectedLanguage?: string;
  detectedCurrencies: string[];
}

export interface DocumentPage {
  pageNumber: number;
  width?: number;
  height?: number;
  hasTables: boolean;
  textSnippet?: string;
}

export interface Document {
  id: string;
  name: string;
  metadata: DocumentMetadata;
  pages: DocumentPage[];
  status: DocumentStatus;
  processingProgress: number; // 0 to 100
  processingStageMessage: string;
}
