import { describe, it, expect } from 'vitest';
import { ValidateAndReconcileUseCase } from '@/application/use-cases/ValidateAndReconcileUseCase';
import { SAMPLE_DOCUMENTS } from '@/infrastructure/ai/fixtures/sampleDocuments';

describe('Deterministic Financial Validation & Reconciliation Use Case', () => {
  it('validates a balanced financial table with 0 errors and 0 warnings', () => {
    const techCorp = SAMPLE_DOCUMENTS.find((d) => d.id === 'doc-techcorp-q4')!;
    const techCorpTable = techCorp.tables[0]!;
    const { validation, reconciliation } = ValidateAndReconcileUseCase.execute(techCorpTable, 'USD');

    expect(validation.isValid).toBe(true);
    expect(validation.totalErrors).toBe(0);
    expect(validation.totalWarnings).toBe(0);
    expect(reconciliation.isReconciled).toBe(true);
  });

  it('detects subtotal discrepancy in Meridian Healthcare audit document', () => {
    const meridian = SAMPLE_DOCUMENTS.find((d) => d.id === 'doc-meridian-audit-issue')!;
    const meridianTable = meridian.tables[0]!;
    const { validation, reconciliation } = ValidateAndReconcileUseCase.execute(meridianTable, 'USD');

    // Expected subtotal sum: 115k + 155k + 70k = 340k, but row lists 325k -> 15k variance
    expect(validation.hasWarnings).toBe(true);
    expect(validation.totalWarnings).toBeGreaterThan(0);
    expect(reconciliation.isReconciled).toBe(false);

    const subtotalIssue = validation.issues.find((i) => i.category === 'ARITHMETIC_SUBTOTAL_MISMATCH');
    expect(subtotalIssue).toBeDefined();
    expect(subtotalIssue?.columnKey).toBe('Expended ($)');
    expect(subtotalIssue?.sourceContext?.foundValue).toBe(325000);
    expect(subtotalIssue?.sourceContext?.expectedValue).toBe(340000);
  });
});
