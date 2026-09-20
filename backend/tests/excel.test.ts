import { describe, it, expect } from 'vitest';
import { ExcelService } from '../src/infrastructure/spreadsheet/ExcelService.js';
import { mockSimpleCanonicalDataset } from './fixtures/testFixtures.js';

describe('ExcelService Generation & Strict Verification (Section 55)', () => {
  it('generates a genuine XLSX buffer and passes read-back verification', async () => {
    const buffer = await ExcelService.generateWorkbookBuffer(mockSimpleCanonicalDataset);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);

    // Read back and verify
    const report = await ExcelService.verifyWorkbookBuffer(buffer, mockSimpleCanonicalDataset);
    expect(report.isVerified).toBe(true);
    expect(report.sheetsCount).toBe(2); // Executive Summary + Table 1
    expect(report.totalRowsFound).toBe(2);
    expect(report.discrepancies.length).toBe(0);
  });

  it('detects discrepancies when dataset expectation mismatches actual file', async () => {
    const buffer = await ExcelService.generateWorkbookBuffer(mockSimpleCanonicalDataset);

    // Modify dataset to expect 10 rows when only 2 exist
    const mismatchedDataset = {
      ...mockSimpleCanonicalDataset,
      tables: [
        {
          ...mockSimpleCanonicalDataset.tables[0],
          rows: [
            ...mockSimpleCanonicalDataset.tables[0].rows,
            { ...mockSimpleCanonicalDataset.tables[0].rows[0], id: 'row-phantom', rowIndex: 3 },
          ],
        },
      ],
    };

    const report = await ExcelService.verifyWorkbookBuffer(buffer, mismatchedDataset);
    expect(report.isVerified).toBe(false);
    expect(report.discrepancies.length).toBeGreaterThan(0);
    expect(report.discrepancies[0]).toContain('Row count mismatch');
  });
});
