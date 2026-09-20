import { describe, it, expect, beforeEach } from 'vitest';
import { ApiClientFactory } from '@/infrastructure/api/ApiClientFactory';
import { MockAIProvider } from '@/infrastructure/ai/MockAIProvider';
import { BackendApiClient } from '@/infrastructure/api/BackendApiClient';
import { SAMPLE_DOCUMENTS } from '@/infrastructure/ai/fixtures/sampleDocuments';
import { CreateCanonicalDatasetUseCase } from '@/application/use-cases/CreateCanonicalDatasetUseCase';
import { ValidateAndReconcileUseCase } from '@/application/use-cases/ValidateAndReconcileUseCase';

describe('API Client Layer & Mock / Backend Switching', () => {
  beforeEach(() => {
    ApiClientFactory.resetInstance();
  });

  it('provides MockAIProvider by default in mock mode', () => {
    const provider = ApiClientFactory.getProvider('mock');
    expect(provider).toBeInstanceOf(MockAIProvider);
    expect(provider.providerName).toContain('MockFinancialAI');
  });

  it('provides BackendApiClient when configured for backend mode', () => {
    const provider = ApiClientFactory.getProvider('backend');
    expect(provider).toBeInstanceOf(BackendApiClient);
    expect(provider.providerName).toBe('ProductionBackendAI');
  });

  it('answers financial chat question accurately citing canonical total row', async () => {
    const provider = new MockAIProvider();
    const fixture = SAMPLE_DOCUMENTS[0]!;
    const table = fixture.tables[0]!;
    const { validation, reconciliation } = ValidateAndReconcileUseCase.execute(table, 'USD');
    const canonicalDataset = CreateCanonicalDatasetUseCase.execute({
      documentId: fixture.id,
      table,
      currency: 'USD',
      validation,
      reconciliation,
      modelUsed: 'Gemini 2.5 Flash',
      processingTimeMs: 120,
    });

    const response = await provider.answerDocumentQuestion(
      'What is the total revenue?',
      canonicalDataset,
      []
    );

    expect(response.answer).toContain('1,845.00');
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0]?.label).toContain('Row #');
  });

  it('throws simulated network failure for Network Failure fixture', async () => {
    const provider = new MockAIProvider();
    const networkFixture = SAMPLE_DOCUMENTS[5]!;

    await expect(
      provider.extractStructuredData(
        {
          id: 'doc-net-err',
          name: networkFixture.name,
          metadata: {
            filename: networkFixture.name,
            sizeBytes: 1000,
            mimeType: 'application/pdf',
            pageCount: 1,
            isScanned: false,
            uploadedAt: new Date().toISOString(),
            detectedCurrencies: ['USD'],
          },
          pages: [],
          status: 'extracting',
          processingProgress: 10,
          processingStageMessage: '',
        },
        {
          isScanned: false,
          pageCount: 1,
          detectedCurrencies: ['USD'],
          estimatedTableCount: 0,
          ocrQuality: 'crisp-digital',
          recommendedModel: 'Gemini 2.5 Flash',
          complexityScore: 1,
        }
      )
    ).rejects.toThrow(/timed out/i);
  });
});
