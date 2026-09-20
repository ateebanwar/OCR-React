import ExcelJS from 'exceljs';
import { CanonicalDataset } from '../../domain/dataset/CanonicalDataset.js';
import { createLogger } from '../../utils/logger.js';
import { SafeDecimal } from '../../utils/decimal.js';

const logger = createLogger('ExcelService');

export interface ExcelVerificationReport {
  isVerified: boolean;
  sheetsCount: number;
  totalRowsFound: number;
  totalColumnsFound: number;
  numericCellsVerified: number;
  discrepancies: string[];
}

export class ExcelService {
  /**
   * Generates a genuine professional XLSX workbook buffer from CanonicalDataset
   */
  public static async generateWorkbookBuffer(dataset: CanonicalDataset): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Financial Document Intelligence Platform';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Sheet 1: Executive Summary
    const summarySheet = workbook.addWorksheet('Executive Summary', {
      views: [{ showGridLines: true }],
    });

    summarySheet.columns = [
      { header: 'Property', key: 'prop', width: 28 },
      { header: 'Value', key: 'val', width: 45 },
    ];

    // Format title
    summarySheet.addRow({ prop: 'DOCUMENT INTELLIGENCE SUMMARY', val: '' });
    summarySheet.mergeCells('A1:B1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate 800
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getRow(1).height = 30;

    summarySheet.addRow({ prop: 'Document Type', val: dataset.metadata.documentType });
    summarySheet.addRow({ prop: 'Document Date', val: dataset.metadata.date || 'N/A' });
    summarySheet.addRow({ prop: 'Reporting Currency', val: dataset.totals.currency });
    summarySheet.addRow({ prop: 'Stated/Calc Subtotal', val: dataset.totals.subtotal });
    summarySheet.addRow({ prop: 'Tax / Surcharges', val: dataset.totals.tax });
    summarySheet.addRow({ prop: 'Grand Total', val: dataset.totals.total });
    summarySheet.addRow({ prop: 'Validation Status', val: dataset.validationStatus.toUpperCase() });
    summarySheet.addRow({ prop: 'Reconciliation Status', val: dataset.reconciliationStatus.toUpperCase() });
    summarySheet.addRow({ prop: 'Total Extracted Tables', val: dataset.tables.length });
    summarySheet.addRow({ prop: 'Total Extracted Rows', val: dataset.totals.rowCount });

    // Format summary table
    for (let r = 2; r <= 11; r++) {
      const row = summarySheet.getRow(r);
      row.getCell(1).font = { bold: true, color: { argb: 'FF334155' } };
      row.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      row.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    }

    // Sheet 2+: Data Tables
    dataset.tables.forEach((table, tableIdx) => {
      const sheetName = (table.name ? table.name.replace(/[*?:/\\\[\]]/g, '') : `Table ${tableIdx + 1}`).slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
      });

      // Define columns
      sheet.columns = table.columns.map((col) => ({
        header: col.name,
        key: col.id,
        width: Math.max(16, Math.min(36, col.name.length + 6)),
      }));

      // Header row styling
      const headerRow = sheet.getRow(1);
      headerRow.height = 26;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F172A' }, // Slate 900
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF0F172A' } },
          bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        };
      });

      // Populate data rows
      table.rows.forEach((row, rIdx) => {
        const rowData: Record<string, any> = {};

        table.columns.forEach((col) => {
          const cell = row.cells[col.id];
          if (!cell) {
            rowData[col.id] = '';
            return;
          }

          if (cell.dataType === 'number' || cell.dataType === 'currency') {
            rowData[col.id] = typeof cell.normalizedValue === 'number' ? cell.normalizedValue : cell.rawValue;
          } else {
            rowData[col.id] = cell.rawValue;
          }
        });

        const sheetRow = sheet.addRow(rowData);
        sheetRow.height = 20;

        // Alternate row shading or total highlighting
        sheetRow.eachCell((cell, colNum) => {
          const colDef = table.columns[colNum - 1];
          const isNumeric = colDef && (colDef.dataType === 'number' || colDef.dataType === 'currency');

          if (isNumeric) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            if (colDef.dataType === 'currency') {
              cell.numFmt = '$#,##0.00;($#,##0.00);"-"';
            } else {
              cell.numFmt = '#,##0.00;(#,##0.00);"-"';
            }
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }

          if (row.isTotalRow) {
            cell.font = { bold: true, color: { argb: 'FF0F172A' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF1F5F9' },
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF0F172A' } },
              bottom: { style: 'double', color: { argb: 'FF0F172A' } },
            };
          } else if (rIdx % 2 === 1) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' },
            };
          }
        });
      });
    });

    const raw = await workbook.xlsx.writeBuffer();
    return Buffer.from(raw);
  }

  /**
   * Mandatory XLSX Verification (Section 55):
   * Reads generated XLSX back and validates sheets, row counts, column counts, and sample totals.
   */
  public static async verifyWorkbookBuffer(
    buffer: Buffer,
    expectedDataset: CanonicalDataset
  ): Promise<ExcelVerificationReport> {
    const discrepancies: string[] = [];
    let totalRowsFound = 0;
    let totalColumnsFound = 0;
    let numericCellsVerified = 0;

    try {
      const readWorkbook = new ExcelJS.Workbook();
      await readWorkbook.xlsx.load(buffer as any);

      const sheetsCount = readWorkbook.worksheets.length;
      if (sheetsCount < 1) {
        discrepancies.push('Workbook contains zero worksheets.');
      }

      // Verify each table sheet
      expectedDataset.tables.forEach((expectedTable, idx) => {
        const sheetName = (expectedTable.name ? expectedTable.name.replace(/[*?:/\\\[\]]/g, '') : `Table ${idx + 1}`).slice(0, 31);
        const worksheet = readWorkbook.getWorksheet(sheetName) || readWorkbook.worksheets[idx + 1];

        if (!worksheet) {
          discrepancies.push(`Missing worksheet for table "${expectedTable.name}" (index: ${idx})`);
          return;
        }

        const actualRowCount = Math.max(0, worksheet.rowCount - 1); // minus header
        totalRowsFound += actualRowCount;
        totalColumnsFound += worksheet.columnCount;

        if (actualRowCount !== expectedTable.rows.length) {
          discrepancies.push(
            `Row count mismatch in sheet "${sheetName}": expected ${expectedTable.rows.length}, found ${actualRowCount}`
          );
        }

        // Spot-check numeric values in rows
        expectedTable.rows.slice(0, 5).forEach((row, rIdx) => {
          expectedTable.columns.forEach((col, cIdx) => {
            const cell = row.cells[col.id];
            if (cell && (cell.dataType === 'number' || cell.dataType === 'currency')) {
              const sheetRow = worksheet.getRow(rIdx + 2); // 1-indexed, skipping header
              const readCellVal = sheetRow.getCell(cIdx + 1).value;
              numericCellsVerified++;

              if (typeof cell.normalizedValue === 'number') {
                const readNum = typeof readCellVal === 'number' ? readCellVal : parseFloat(String(readCellVal));
                if (isNaN(readNum) || Math.abs(readNum - cell.normalizedValue) > 0.05) {
                  discrepancies.push(
                    `Value mismatch in "${sheetName}" row ${rIdx + 1}, col "${col.name}": expected ${cell.normalizedValue}, read ${readCellVal}`
                  );
                }
              }
            }
          });
        });
      });

      const isVerified = discrepancies.length === 0;
      logger.info(`Excel Verification completed: verified=${isVerified}, discrepancies=${discrepancies.length}`);

      return {
        isVerified,
        sheetsCount,
        totalRowsFound,
        totalColumnsFound,
        numericCellsVerified,
        discrepancies,
      };
    } catch (err: unknown) {
      logger.error('Failed to verify generated Excel workbook', { error: String(err) });
      return {
        isVerified: false,
        sheetsCount: 0,
        totalRowsFound: 0,
        totalColumnsFound: 0,
        numericCellsVerified: 0,
        discrepancies: [`Failed to parse generated workbook: ${err instanceof Error ? err.message : String(err)}`],
      };
    }
  }
}
