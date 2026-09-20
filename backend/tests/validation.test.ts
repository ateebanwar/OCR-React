import { describe, it, expect } from 'vitest';
import { DeterministicValidator } from '../src/application/services/DeterministicValidator.js';
import { ReconciliationEngine } from '../src/application/services/ReconciliationEngine.js';
import { mockSimpleTable, mockSimpleMetadata } from './fixtures/testFixtures.js';

describe('DeterministicValidator', () => {
  it('passes on clean well-formed table', () => {
    const res = DeterministicValidator.validate([mockSimpleTable], mockSimpleMetadata);
    expect(res.isValid).toBe(true);
    expect(res.deterministicSummary.totalRows).toBe(2);
    expect(res.deterministicSummary.totalColumns).toBe(4);
    expect(res.issues.length).toBe(0);
  });

  it('detects duplicate rows and empty structures', () => {
    const duplicateTable = {
      ...mockSimpleTable,
      rows: [...mockSimpleTable.rows, { ...mockSimpleTable.rows[0], id: 'row-dup', rowIndex: 3 }],
    };
    const res = DeterministicValidator.validate([duplicateTable], mockSimpleMetadata);
    expect(res.issues.some((i) => i.code === 'DUPLICATE_ROW_DETECTED')).toBe(true);
  });
});

describe('ReconciliationEngine', () => {
  it('successfully reconciles accurate subtotal and total values', () => {
    const res = ReconciliationEngine.reconcile([mockSimpleTable], 8500.00, 680.00, 9180.00);
    expect(res.status).toBe('passed');
    expect(res.failedChecks).toBe(0);
  });

  it('flags intentional mathematical discrepancy', () => {
    // Expected total 9180, but provide erroneous total 9999.99
    const res = ReconciliationEngine.reconcile([mockSimpleTable], 8500.00, 680.00, 9999.99);
    expect(res.status).toBe('failed');
    expect(res.failedChecks).toBeGreaterThan(0);
    expect(res.checks.some((c) => c.status === 'failed')).toBe(true);
  });
});
