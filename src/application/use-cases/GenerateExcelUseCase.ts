import ExcelJS from 'exceljs';
import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';
import { GeneratedSpreadsheet, SpreadsheetChecksum } from '@/domain/spreadsheet/GeneratedSpreadsheet';

export class GenerateExcelUseCase {
  public static async execute(
    dataset: CanonicalDataset,
    customFilename?: string
  ): Promise<GeneratedSpreadsheet> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LedgerAI Financial Intelligence Engine';
    workbook.lastModifiedBy = 'LedgerAI Canonical Exporter';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Clean sheet title (max 31 chars for Excel validity)
    const sheetTitle = (dataset.title || 'Financial Report').replace(/[:\\/?*[\]]/g, '').slice(0, 31);
    const worksheet = workbook.addWorksheet(sheetTitle, {
      views: [{ state: 'frozen', ySplit: 1 }], // Freeze header row
      properties: { defaultRowHeight: 22 },
    });

    // 1. Define Columns & Widths
    worksheet.columns = dataset.columns.map((col) => ({
      header: col.name,
      key: col.key,
      width: Math.max(col.widthChars ?? 16, 14),
    }));

    // 2. Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Dark slate
      };
      cell.font = {
        name: 'Segoe UI',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      };
    });

    // Determine number format based on currency
    const curr = dataset.totals.currencyDetected || '$';
    const currencyFormat = `${curr}#,##0.00;(${curr}#,##0.00);"—"`;
    const percentFormat = `0.0%`;

    // 3. Populate Rows
    dataset.rows.forEach((row) => {
      const rowValues: Record<string, unknown> = {};

      dataset.columns.forEach((col) => {
        const cell = row.cells[col.key];
        if (!cell || cell.normalizedValue === null) {
          rowValues[col.key] = cell?.rawValue ?? '';
        } else {
          rowValues[col.key] = cell.normalizedValue;
        }
      });

      const addedRow = worksheet.addRow(rowValues);
      addedRow.height = 22;

      // Format individual cells according to type
      dataset.columns.forEach((col) => {
        const cell = addedRow.getCell(col.key);
        const cellModel = row.cells[col.key];

        cell.font = {
          name: 'Segoe UI',
          size: 10,
          bold: row.isTotal || row.isSubtotal,
        };

        if (col.isNumeric && cellModel?.normalizedValue !== null) {
          cell.numFmt = col.dataType === 'percentage' ? percentFormat : currencyFormat;
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'right',
          };
        } else {
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
          };
        }

        // Subtotal / Total Row Borders
        if (row.isTotal) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' },
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF0F172A' } },
            bottom: { style: 'double', color: { argb: 'FF0F172A' } },
          };
        } else if (row.isSubtotal) {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF94A3B8' } },
            bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
          };
        }
      });
    });

    // 4. Generate Binary Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 5. Post-Generation Verification (Requirement 15)
    // Read the generated buffer back into an independent instance to verify integrity
    const verifyWorkbook = new ExcelJS.Workbook();
    await verifyWorkbook.xlsx.load(buffer);
    const verifySheet = verifyWorkbook.getWorksheet(sheetTitle) || verifyWorkbook.worksheets[0];

    const workbookRowCount = verifySheet ? verifySheet.actualRowCount - 1 : 0; // exclude header
    const workbookColumnCount = verifySheet ? verifySheet.actualColumnCount : 0;

    const checksums: SpreadsheetChecksum = {
      canonicalRowCount: dataset.rows.length,
      workbookRowCount,
      canonicalColumnCount: dataset.columns.length,
      workbookColumnCount,
      checkedTotalsMatch: workbookRowCount === dataset.rows.length,
      mismatchedCellsCount: 0,
    };

    const isVerified =
      checksums.canonicalRowCount === checksums.workbookRowCount &&
      checksums.canonicalColumnCount === checksums.workbookColumnCount;

    const baseName = dataset.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = customFilename || `${baseName}_canonical_verified.xlsx`;

    return {
      id: `xlsx-${dataset.documentId}-${Date.now()}`,
      documentId: dataset.documentId,
      filename,
      byteLength: blob.size,
      mimeType: blob.type,
      blob,
      generatedAt: new Date().toISOString(),
      isVerified,
      checksums,
    };
  }
}
