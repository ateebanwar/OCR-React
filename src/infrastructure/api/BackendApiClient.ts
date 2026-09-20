import { AIProvider, DocumentAnalysisReport, ChatAnswerResponse, ProcessingStageCallback } from '../ai/AIProvider';
import { Document } from '@/domain/document/Document';
import { ExtractionResult } from '@/domain/extraction/ExtractionResult';
import { ChatMessage } from '@/domain/conversation/Conversation';
import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';
import { ApplicationError } from '@/core/errors/ApplicationError';
import { appConfig } from '@/core/configuration/appConfig';

export class BackendApiClient implements AIProvider {
  public readonly providerName = 'ProductionBackendAI';
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || appConfig.apiBaseUrl;
  }

  public async analyzeDocument(
    file: File | { name: string; size: number },
    signal?: AbortSignal
  ): Promise<DocumentAnalysisReport> {
    try {
      const formData = new FormData();
      if ('lastModified' in file) {
        formData.append('file', file as File);
      } else {
        formData.append('filename', file.name);
        formData.append('sizeBytes', String(file.size));
      }

      const response = await fetch(`${this.baseUrl}/documents/analyze`, {
        method: 'POST',
        body: formData,
        signal,
        headers: {
          'X-Client-Version': appConfig.version,
          'X-Request-Id': `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        },
      });

      if (!response.ok) {
        throw new ApplicationError({
          code: 'AI_PROVIDER_ERROR',
          message: `Backend analysis returned status HTTP ${response.status}`,
          userMessage: 'The backend service was unable to analyze this document.',
        });
      }

      return (await response.json()) as DocumentAnalysisReport;
    } catch (err: unknown) {
      if (err instanceof ApplicationError) throw err;
      throw new ApplicationError({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network failure contacting backend API',
        userMessage: 'Unable to connect to the backend document intelligence API.',
        cause: err,
      });
    }
  }

  public async extractStructuredData(
    document: Document,
    _report: DocumentAnalysisReport,
    onProgress?: ProcessingStageCallback,
    signal?: AbortSignal
  ): Promise<ExtractionResult> {
    onProgress?.('Sending payload to production backend', 20, 'Dispatching file to secure processing cluster');

    try {
      const response = await fetch(`${this.baseUrl}/documents/${document.id}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': appConfig.version,
          'X-Request-Id': `req-${Date.now()}`,
        },
        body: JSON.stringify({ documentId: document.id, metadata: document.metadata }),
        signal,
      });

      if (!response.ok) {
        throw new ApplicationError({
          code: 'PROCESSING_ERROR',
          message: `Extraction failed with HTTP ${response.status}`,
          userMessage: 'The backend failed to extract structured tables from the document.',
        });
      }

      onProgress?.('Extraction completed by backend model', 85, 'Validating schema at infrastructure boundary');
      return (await response.json()) as ExtractionResult;
    } catch (err: unknown) {
      if (err instanceof ApplicationError) throw err;
      throw new ApplicationError({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error during extraction',
        userMessage: 'Network disconnected during document extraction.',
        cause: err,
      });
    }
  }

  public async answerDocumentQuestion(
    question: string,
    canonicalDataset: CanonicalDataset | null,
    history: ChatMessage[],
    signal?: AbortSignal
  ): Promise<ChatAnswerResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Version': appConfig.version,
        },
        body: JSON.stringify({
          question,
          canonicalDatasetId: canonicalDataset?.id,
          canonicalTotals: canonicalDataset?.totals,
          history: history.slice(-6),
        }),
        signal,
      });

      if (!response.ok) {
        throw new ApplicationError({
          code: 'AI_PROVIDER_ERROR',
          message: `Chat API responded with ${response.status}`,
          userMessage: 'Failed to receive answer from financial intelligence service.',
        });
      }

      return (await response.json()) as ChatAnswerResponse;
    } catch (err: unknown) {
      if (err instanceof ApplicationError) throw err;
      throw new ApplicationError({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Chat network error',
        userMessage: 'Could not connect to the financial chat service.',
        cause: err,
      });
    }
  }

  public async summarizeDocument(
    canonicalDataset: CanonicalDataset,
    signal?: AbortSignal
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/documents/${canonicalDataset.documentId}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totals: canonicalDataset.totals }),
      signal,
    });
    const data = await response.json();
    return data.summary;
  }
}
