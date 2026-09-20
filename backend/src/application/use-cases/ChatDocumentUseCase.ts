import { documentStore } from '../../infrastructure/storage/DocumentStore.js';
import { GeminiService } from '../../infrastructure/gemini/GeminiService.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ChatDocumentUseCase');

export interface ChatDocumentRequest {
  documentId?: string;
  canonicalDatasetId?: string;
  question: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface ChatDocumentResponse {
  answer: string;
  source: 'deterministic-canonical' | 'gemini-grounded';
  citations: Array<{ page: number; tableId?: string; snippet: string }>;
  suggestedFollowUps: string[];
}

export class ChatDocumentUseCase {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  public async execute(req: ChatDocumentRequest): Promise<ChatDocumentResponse> {
    const session = req.documentId ? documentStore.get(req.documentId) : undefined;
    const dataset = session?.canonicalDataset || null;

    logger.info(`Processing chat question: "${req.question}" (document: ${req.documentId || 'none'})`);

    // 1. Check if question can be answered DETERMINISTICALLY from Canonical Dataset (Requirement 49)
    if (dataset) {
      const qLower = req.question.toLowerCase().trim();

      if (/(what is the total|grand total|final amount|total balance)/i.test(qLower)) {
        return {
          answer: `The verified grand total is ${dataset.totals.currency} ${dataset.totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
          source: 'deterministic-canonical',
          citations: [{ page: 1, snippet: `Canonical Totals: Total = ${dataset.totals.currency} ${dataset.totals.total}` }],
          suggestedFollowUps: ['What is the subtotal?', 'Are there any reconciliation warnings?'],
        };
      }

      if (/(what is the subtotal|net amount|sub-total)/i.test(qLower)) {
        return {
          answer: `The calculated subtotal is ${dataset.totals.currency} ${dataset.totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
          source: 'deterministic-canonical',
          citations: [{ page: 1, snippet: `Canonical Totals: Subtotal = ${dataset.totals.currency} ${dataset.totals.subtotal}` }],
          suggestedFollowUps: ['What is the tax amount?', 'What is the grand total?'],
        };
      }

      if (/(how many rows|number of rows|row count)/i.test(qLower)) {
        return {
          answer: `The document contains ${dataset.totals.rowCount} extracted data rows across ${dataset.tables.length} table(s).`,
          source: 'deterministic-canonical',
          citations: [{ page: 1, snippet: `Dataset metadata: ${dataset.totals.rowCount} rows` }],
          suggestedFollowUps: ['Show table summary', 'What are the column names?'],
        };
      }

      if (/(what is the date|invoice date|document date|when was this created)/i.test(qLower)) {
        return {
          answer: `The documented date is ${dataset.metadata.date || 'not specified on this document'}.`,
          source: 'deterministic-canonical',
          citations: [{ page: 1, snippet: `Metadata Date: ${dataset.metadata.date || 'N/A'}` }],
          suggestedFollowUps: ['What is the company name?', 'What is the total?'],
        };
      }

      if (/(what is the invoice number|invoice id|reference number)/i.test(qLower)) {
        return {
          answer: `The extracted invoice number is ${dataset.metadata.invoiceNumber || 'not explicitly detected'}.`,
          source: 'deterministic-canonical',
          citations: [{ page: 1, snippet: `Invoice Reference: ${dataset.metadata.invoiceNumber || 'N/A'}` }],
          suggestedFollowUps: ['Who is the vendor?', 'What is the grand total?'],
        };
      }
    }

    // 2. Otherwise invoke Gemini with Canonical Dataset grounding (Requirement 50)
    const geminiResult = await this.geminiService.answerQuestion(
      req.question,
      dataset,
      req.history || []
    );

    return {
      answer: geminiResult.answer,
      source: 'gemini-grounded',
      citations: geminiResult.citations,
      suggestedFollowUps: [
        'Can you summarize the line items?',
        'Export this document to Excel',
        'Verify subtotal accuracy',
      ],
    };
  }
}
