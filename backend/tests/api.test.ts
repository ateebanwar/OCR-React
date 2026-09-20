import { describe, it, expect } from 'vitest';
import { ProcessDocumentUseCase } from '../src/application/use-cases/ProcessDocumentUseCase.js';
import { ChatDocumentUseCase } from '../src/application/use-cases/ChatDocumentUseCase.js';
import { GenerateSpreadsheetUseCase } from '../src/application/use-cases/GenerateSpreadsheetUseCase.js';
import { mockSimpleCanonicalDataset } from './fixtures/testFixtures.js';

describe('Application Use Cases & Processing Pipeline', () => {
  it('executes full ProcessDocumentUseCase pipeline end-to-end', async () => {
    const useCase = new ProcessDocumentUseCase();
    const result = await useCase.execute({
      filename: 'Q1_Financial_Report.pdf',
      buffer: Buffer.from('%PDF-1.4 sample content'),
      mimetype: 'application/pdf',
      requestId: 'test-req-123',
    });

    expect(result.success).toBe(true);
    expect(result.documentId).toMatch(/^doc-/);
    expect(result.processingId).toMatch(/^proc-/);
    expect(result.canonicalDataset).toBeDefined();
    expect(result.canonicalDataset.tables.length).toBeGreaterThan(0);
    expect(result.validation.isValid).toBe(true);
    expect(result.reconciliation.status).toBe('passed');
    expect(result.excelVerified).toBe(true);
  });

  it('answers deterministic questions directly from Canonical Dataset without AI hallucination', async () => {
    const chatUseCase = new ChatDocumentUseCase();

    // First store dataset in session
    const procUseCase = new ProcessDocumentUseCase();
    const procResult = await procUseCase.execute({
      filename: 'Invoice_Test.pdf',
      buffer: Buffer.from('%PDF-1.4 test'),
      mimetype: 'application/pdf',
      requestId: 'test-req-chat',
    });

    const response = await chatUseCase.execute({
      documentId: procResult.documentId,
      question: 'What is the grand total?',
    });

    expect(response.source).toBe('deterministic-canonical');
    expect(response.answer).toContain('grand total');
    expect(response.citations.length).toBeGreaterThan(0);
  });

  it('generates verified spreadsheet attachment', async () => {
    const result = await GenerateSpreadsheetUseCase.execute(undefined, mockSimpleCanonicalDataset);
    expect(result.filename).toContain('.xlsx');
    expect(result.filesize).toBeGreaterThan(1000);
    expect(result.verification.isVerified).toBe(true);
  });
});
