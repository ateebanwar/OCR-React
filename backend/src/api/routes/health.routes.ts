import { Router, Request, Response } from 'express';
import { GeminiService } from '../../infrastructure/gemini/GeminiService.js';

export const healthRouter = Router();
const geminiService = new GeminiService();

healthRouter.get(['/', '/health', '/api/v1/health'], (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'OCR-React Financial Document Intelligence API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      geminiConfigured: geminiService.isConfigured(),
    },
  });
});
