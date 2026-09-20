import { documentStore } from '../../infrastructure/storage/DocumentStore.js';
import { ExcelService, ExcelVerificationReport } from '../../infrastructure/spreadsheet/ExcelService.js';
import { CanonicalDataset } from '../../domain/dataset/CanonicalDataset.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('GenerateSpreadsheetUseCase');

export interface GenerateSpreadsheetResult {
  buffer: Buffer;
  filename: string;
  filesize: number;
  verification: ExcelVerificationReport;
}

export class GenerateSpreadsheetUseCase {
  public static async execute(
    documentId?: string,
    providedDataset?: CanonicalDataset
  ): Promise<GenerateSpreadsheetResult> {
    let dataset: CanonicalDataset | undefined = providedDataset;

    if (!dataset && documentId) {
      const session = documentStore.get(documentId);
      dataset = session?.canonicalDataset;
    }

    if (!dataset) {
      throw new Error('No canonical dataset found to generate spreadsheet.');
    }

    logger.info(`Generating XLSX for dataset: ${dataset.id} (document: ${dataset.documentId})`);

    const buffer = await ExcelService.generateWorkbookBuffer(dataset);
    const verification = await ExcelService.verifyWorkbookBuffer(buffer, dataset);

    if (!verification.isVerified) {
      logger.warn('Spreadsheet verification warnings/discrepancies detected', {
        discrepancies: verification.discrepancies,
      });
    }

    const docName = dataset.metadata.title ? dataset.metadata.title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'financial_report';
    const filename = `${docName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    return {
      buffer,
      filename,
      filesize: buffer.length,
      verification,
    };
  }
}
