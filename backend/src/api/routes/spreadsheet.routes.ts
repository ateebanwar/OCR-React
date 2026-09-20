import { Router, Request, Response, NextFunction } from 'express';
import { GenerateSpreadsheetUseCase } from '../../application/use-cases/GenerateSpreadsheetUseCase.js';
import { ExcelService } from '../../infrastructure/spreadsheet/ExcelService.js';
import { uploadMiddleware } from '../middleware/upload.js';

export const spreadsheetRouter = Router();

spreadsheetRouter.post(
  ['/generate', '/api/v1/spreadsheets/generate'],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId, dataset } = req.body;

      const result = await GenerateSpreadsheetUseCase.execute(documentId, dataset);

      if (!result.verification.isVerified) {
        res.status(422).json({
          success: false,
          error: {
            code: 'SPREADSHEET_VERIFICATION_FAILED',
            message: 'Generated workbook failed strict post-generation verification.',
            details: result.verification.discrepancies,
            requestId: req.requestId,
          },
        });
        return;
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('X-Spreadsheet-Verified', 'true');
      res.setHeader('X-Spreadsheet-Sheets', result.verification.sheetsCount);
      res.setHeader('X-Spreadsheet-Rows', result.verification.totalRowsFound);

      res.status(200).send(result.buffer);
    } catch (err) {
      next(err);
    }
  }
);

spreadsheetRouter.post(
  ['/verify', '/api/v1/spreadsheets/verify'],
  uploadMiddleware.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'FILE_MISSING', message: 'XLSX file is required for verification.', requestId: req.requestId },
        });
        return;
      }

      let expectedDataset;
      if (req.body.dataset) {
        try {
          expectedDataset = typeof req.body.dataset === 'string' ? JSON.parse(req.body.dataset) : req.body.dataset;
        } catch {
          // ignore parse error
        }
      }

      if (!expectedDataset) {
        res.status(400).json({
          success: false,
          error: { code: 'DATASET_MISSING', message: 'Target CanonicalDataset is required for comparison.', requestId: req.requestId },
        });
        return;
      }

      const report = await ExcelService.verifyWorkbookBuffer(req.file.buffer, expectedDataset);

      res.status(200).json({
        success: report.isVerified,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
);
