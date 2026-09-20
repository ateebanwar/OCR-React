import { AIProvider, DocumentAnalysisReport, ProcessingStageCallback } from '../ai/AIProvider';
import { ApiClientFactory } from './ApiClientFactory';
import { Document } from '@/domain/document/Document';
import { ExtractionResult } from '@/domain/extraction/ExtractionResult';

export class DocumentApi {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider ?? ApiClientFactory.getProvider();
  }

  public async analyzeDocument(
    file: File | { name: string; size: number },
    signal?: AbortSignal
  ): Promise<DocumentAnalysisReport> {
    return this.provider.analyzeDocument(file, signal);
  }

  public async extractStructuredData(
    document: Document,
    report: DocumentAnalysisReport,
    onProgress?: ProcessingStageCallback,
    signal?: AbortSignal
  ): Promise<ExtractionResult> {
    return this.provider.extractStructuredData(document, report, onProgress, signal);
  }

  public async summarizeDocument(
    canonicalDataset: any,
    signal?: AbortSignal
  ): Promise<string> {
    return this.provider.summarizeDocument(canonicalDataset, signal);
  }
}
