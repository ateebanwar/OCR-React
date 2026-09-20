import pdfParse from 'pdf-parse';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('PdfParserService');

export interface ParsedPdfMetadata {
  pageCount: number;
  info: Record<string, unknown>;
  textLength: number;
  isScanned: boolean;
  ocrQuality: 'crisp-digital' | 'scanned-clean' | 'scanned-noisy' | 'handwritten-elements';
  complexityScore: number;
}

export class PdfParserService {
  public static async analyze(buffer: Buffer): Promise<ParsedPdfMetadata> {
    if (!buffer || buffer.length < 50 || !buffer.subarray(0, 5).toString().includes('%PDF')) {
      return {
        pageCount: 1,
        info: {},
        textLength: buffer ? buffer.length : 0,
        isScanned: false,
        ocrQuality: 'crisp-digital',
        complexityScore: 2,
      };
    }

    try {
      const parsePromise = pdfParse(buffer);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('PDF parsing timed out')), 1500)
      );
      const data = await Promise.race([parsePromise, timeoutPromise]);
      const pageCount = data.numpages || 1;
      const textLength = data.text ? data.text.trim().length : 0;
      const textPerPage = textLength / pageCount;

      // If very little text per page, it's likely scanned / image-only
      const isScanned = textPerPage < 50;
      const ocrQuality = isScanned
        ? 'scanned-noisy'
        : textPerPage > 400
        ? 'crisp-digital'
        : 'scanned-clean';

      const complexityScore = Math.min(
        10,
        Math.max(1, Math.round((pageCount * 1.2) + (isScanned ? 3 : 0)))
      );

      logger.info(`Analyzed PDF: ${pageCount} pages, ${textLength} chars, isScanned: ${isScanned}`);

      return {
        pageCount,
        info: data.info || {},
        textLength,
        isScanned,
        ocrQuality,
        complexityScore,
      };
    } catch (err: unknown) {
      logger.warn('pdf-parse failed or file is raw binary, defaulting analysis', { error: String(err) });
      return {
        pageCount: 1,
        info: {},
        textLength: 0,
        isScanned: true,
        ocrQuality: 'scanned-clean',
        complexityScore: 5,
      };
    }
  }
}
