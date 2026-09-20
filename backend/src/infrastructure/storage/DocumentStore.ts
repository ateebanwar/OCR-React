import { CanonicalDataset } from '../../domain/dataset/CanonicalDataset.js';
import { ParsedPdfMetadata } from '../pdf/PdfParserService.js';

export interface StoredDocumentSession {
  id: string;
  processingId: string;
  filename: string;
  filesize: number;
  buffer?: Buffer;
  pdfAnalysis?: ParsedPdfMetadata;
  canonicalDataset?: CanonicalDataset;
  createdAt: number;
}

class InMemoryDocumentStore {
  private sessions = new Map<string, StoredDocumentSession>();

  public save(session: StoredDocumentSession): void {
    this.sessions.set(session.id, session);
    this.sessions.set(session.processingId, session);
  }

  public get(idOrProcessingId: string): StoredDocumentSession | undefined {
    return this.sessions.get(idOrProcessingId);
  }

  public delete(id: string): void {
    this.sessions.delete(id);
  }

  public cleanup(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [key, session] of this.sessions.entries()) {
      if (now - session.createdAt > maxAgeMs) {
        this.sessions.delete(key);
      }
    }
  }
}

export const documentStore = new InMemoryDocumentStore();
