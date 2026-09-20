import { describe, it, expect } from 'vitest';
import { CreateCanonicalDatasetUseCase } from '@/application/use-cases/CreateCanonicalDatasetUseCase';
import { ValidateAndReconcileUseCase } from '@/application/use-cases/ValidateAndReconcileUseCase';
import { GenerateExcelUseCase } from '@/application/use-cases/GenerateExcelUseCase';
import { SAMPLE_DOCUMENTS } from '@/infrastructure/ai/fixtures/sampleDocuments';

describe('Genuine Excel Generation & Post-Generation Verification', () => {
  it('generates authentic .xlsx binary and verifies checksums against canonical dataset', async () => {
    const fixture = SAMPLE_DOCUMENTS[0]!;
    const table = fixture.tables[0]!;

    const { validation, reconciliation } = ValidateAndReconcileUseCase.execute(table, fixture.currency);
    const canonicalDataset = CreateCanonicalDatasetUseCase.execute({
      documentId: fixture.id,
      table,
      currency: fixture.currency,
      validation,
      reconciliation,
      modelUsed: 'Gemini 2.5 Flash',
      processingTimeMs: 420,
    });

    const generatedSpreadsheet = await GenerateExcelUseCase.execute(canonicalDataset);

    expect(generatedSpreadsheet.byteLength).toBeGreaterThan(1000);
    expect(generatedSpreadsheet.filename).toContain('.xlsx');
    expect(generatedSpreadsheet.isVerified).toBe(true);
    expect(generatedSpreadsheet.checksums.canonicalRowCount).toBe(table.rows.length);
    expect(generatedSpreadsheet.checksums.workbookRowCount).toBe(table.rows.length);
    expect(generatedSpreadsheet.checksums.canonicalColumnCount).toBe(table.headers.length);
    expect(generatedSpreadsheet.checksums.workbookColumnCount).toBe(table.headers.length);
  });
});
