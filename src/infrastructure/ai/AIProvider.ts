import { Document } from '@/domain/document/Document';
import { ExtractionResult } from '@/domain/extraction/ExtractionResult';
import { ChatMessage, MessageCitation } from '@/domain/conversation/Conversation';
import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';

export interface DocumentAnalysisReport {
  isScanned: boolean;
  pageCount: number;
  detectedCurrencies: string[];
  estimatedTableCount: number;
  ocrQuality: 'crisp-digital' | 'scanned-clean' | 'scanned-noisy' | 'handwritten-elements';
  recommendedModel: string;
  complexityScore: number; // 0 to 10
}

export interface ChatAnswerResponse {
  answer: string;
  citations: MessageCitation[];
  suggestedFollowUps: string[];
}

export interface ProcessingStageCallback {
  (stage: string, progress: number, details?: string): void;
}

export interface AIProvider {
  readonly providerName: string;

  analyzeDocument(
    file: File | { name: string; size: number },
    signal?: AbortSignal
  ): Promise<DocumentAnalysisReport>;

  extractStructuredData(
    document: Document,
    report: DocumentAnalysisReport,
    onProgress?: ProcessingStageCallback,
    signal?: AbortSignal
  ): Promise<ExtractionResult>;

  answerDocumentQuestion(
    question: string,
    canonicalDataset: CanonicalDataset | null,
    history: ChatMessage[],
    signal?: AbortSignal
  ): Promise<ChatAnswerResponse>;

  summarizeDocument(
    canonicalDataset: CanonicalDataset,
    signal?: AbortSignal
  ): Promise<string>;
}
