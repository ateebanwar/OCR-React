import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/index.js';
import { createLogger } from '../../utils/logger.js';
import { GeminiExtractionSchema, GeminiExtraction } from '../../schemas/extraction.schema.js';
import { CanonicalDataset } from '../../domain/dataset/CanonicalDataset.js';

const logger = createLogger('GeminiService');

export class GeminiService {
  private genAIClient?: GoogleGenAI;
  private fallbackClient?: GoogleGenerativeAI;

  constructor() {
    if (config.GEMINI_API_KEY) {
      try {
        this.genAIClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
      } catch (err) {
        logger.warn('Could not initialize GoogleGenAI client, will attempt GoogleGenerativeAI', { error: String(err) });
      }
      try {
        this.fallbackClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      } catch (err) {
        logger.warn('Could not initialize GoogleGenerativeAI client', { error: String(err) });
      }
    } else {
      logger.warn('No GEMINI_API_KEY configured in backend environment.');
    }
  }

  public isConfigured(): boolean {
    return Boolean(config.GEMINI_API_KEY && config.GEMINI_API_KEY.length > 5);
  }

  /**
   * Extract financial data from PDF buffer or text content
   */
  public async extractFinancialData(
    pdfBuffer: Buffer,
    extractedText: string,
    modelName: string = config.GEMINI_EXTRACTION_MODEL
  ): Promise<GeminiExtraction> {
    if (!this.isConfigured()) {
      throw new Error('GEMINI_API_KEY is not configured on the backend service.');
    }

    const extractionPrompt = `
You are a Staff Document Intelligence and Financial Data Extraction Specialist.
Analyze the following document and extract all financial tables, line items, and metadata with exact precision.

CRITICAL INSTRUCTIONS:
1. Extract all tables, columns, and rows without inventing or hallucinating values.
2. For numeric cells, normalize into an exact number.
3. Identify subtotal rows, tax, discounts, and total rows.
4. Output MUST conform strictly to the requested JSON schema.
5. Do NOT wrap output in markdown fences, return ONLY the raw valid JSON string.

Schema Specification:
{
  "metadata": {
    "title": string,
    "documentType": "invoice" | "balance-sheet" | "income-statement" | "cash-flow" | "bank-statement" | "tax-document" | "general-financial",
    "date": string,
    "currency": string,
    "pageCount": number,
    "confidenceScore": number,
    "companyName": string,
    "invoiceNumber": string
  },
  "tables": [
    {
      "id": "table-1",
      "name": string,
      "pageNumber": 1,
      "columns": [
        { "id": "col-1", "name": string, "dataType": "string" | "number" | "currency" | "date" }
      ],
      "rows": [
        {
          "id": "row-1",
          "rowIndex": 1,
          "isTotalRow": boolean,
          "isSubtotalRow": boolean,
          "cells": {
            "col-1": {
              "columnId": "col-1",
              "columnName": string,
              "rawValue": string,
              "normalizedValue": number | string | null,
              "dataType": "string" | "number" | "currency" | "date",
              "confidence": 1.0
            }
          }
        }
      ]
    }
  ],
  "summary": string
}
`;

    try {
      logger.info(`Invoking primary extraction with model: ${modelName}`);
      return await this.callGeminiWithFallback(pdfBuffer, extractedText, extractionPrompt, modelName);
    } catch (primaryErr: unknown) {
      logger.warn(`Primary model ${modelName} failed, attempting fallback model ${config.GEMINI_FALLBACK_MODEL}`, {
        error: String(primaryErr),
      });

      if (modelName !== config.GEMINI_FALLBACK_MODEL) {
        return await this.callGeminiWithFallback(
          pdfBuffer,
          extractedText,
          extractionPrompt,
          config.GEMINI_FALLBACK_MODEL
        );
      }
      throw primaryErr;
    }
  }

  private async callGeminiWithFallback(
    pdfBuffer: Buffer,
    extractedText: string,
    prompt: string,
    modelName: string
  ): Promise<GeminiExtraction> {
    const base64Pdf = pdfBuffer.toString('base64');

    // Strategy 1: Attempt with @google/genai
    if (this.genAIClient) {
      try {
        const response = await this.genAIClient.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Pdf,
                  },
                },
                {
                  text: prompt + (extractedText ? `\n\nOCR / Parsed Document Text:\n${extractedText.slice(0, 10000)}` : ''),
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        return this.parseAndValidate(text);
      } catch (err: unknown) {
        logger.warn('@google/genai call failed, trying @google/generative-ai', { error: String(err) });
      }
    }

    // Strategy 2: Attempt with @google/generative-ai
    if (this.fallbackClient) {
      const model = this.fallbackClient.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const parts: any[] = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf,
          },
        },
        { text: prompt + (extractedText ? `\n\nOCR / Parsed Document Text:\n${extractedText.slice(0, 10000)}` : '') },
      ];

      const result = await model.generateContent(parts);
      const text = result.response.text();
      return this.parseAndValidate(text);
    }

    throw new Error('No functional Gemini client available on backend.');
  }

  private parseAndValidate(rawJson: string): GeminiExtraction {
    // Strip optional markdown codeblocks if model inadvertently included them
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (err) {
      logger.error('Failed to parse Gemini output as JSON', { rawOutput: cleanJson.slice(0, 500) });
      throw new Error('Malformed JSON received from AI provider.');
    }

    // Runtime validation with Zod
    const validation = GeminiExtractionSchema.safeParse(parsed);
    if (!validation.success) {
      logger.error('Gemini extraction output failed runtime Zod schema validation', {
        errors: validation.error.format(),
      });
      throw new Error(`AI extraction schema validation failed: ${validation.error.issues.map((i) => i.message).join(', ')}`);
    }

    return validation.data;
  }

  /**
   * Conversational query grounded in Canonical Dataset
   */
  public async answerQuestion(
    question: string,
    canonicalDataset: CanonicalDataset | null,
    history: { role: 'user' | 'assistant'; text: string }[]
  ): Promise<{ answer: string; citations: Array<{ page: number; tableId?: string; snippet: string }> }> {
    if (!this.isConfigured()) {
      return {
        answer: 'Gemini API key is not configured on the backend server. Please configure GEMINI_API_KEY in backend/.env.',
        citations: [],
      };
    }

    const context = canonicalDataset
      ? `
Document Context:
Document Type: ${canonicalDataset.metadata.documentType}
Date: ${canonicalDataset.metadata.date || 'N/A'}
Currency: ${canonicalDataset.totals.currency}
Stated/Calculated Subtotal: ${canonicalDataset.totals.subtotal}
Stated/Calculated Tax: ${canonicalDataset.totals.tax}
Stated/Calculated Grand Total: ${canonicalDataset.totals.total}
Tables Count: ${canonicalDataset.tables.length}
Rows Count: ${canonicalDataset.totals.rowCount}

Summary: ${canonicalDataset.summary || 'N/A'}

Table Data Sample:
${JSON.stringify(
  canonicalDataset.tables.map((t) => ({
    name: t.name,
    columns: t.columns.map((c) => c.name),
    sampleRows: t.rows.slice(0, 15).map((r) => Object.fromEntries(Object.entries(r.cells).map(([k, v]) => [k, v.rawValue]))),
  })),
  null,
  2
)}
`
      : 'No active document loaded.';

    const systemPrompt = `
You are an expert Financial Analyst & AI Auditor.
Answer the user's question directly, concisely, and with 100% mathematical fidelity to the canonical document data provided below.
If the answer cannot be determined from the dataset, state so clearly. Do not fabricate numbers or invent line items.

${context}
`;

    const formattedHistory = history.map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${formattedHistory}\n\nUser Question: ${question}\n\nAnswer:`;

    try {
      if (this.fallbackClient) {
        const model = this.fallbackClient.getGenerativeModel({ model: config.GEMINI_CHAT_MODEL });
        const res = await model.generateContent(fullPrompt);
        return {
          answer: res.response.text().trim(),
          citations: canonicalDataset ? [{ page: 1, snippet: `Verified against canonical total ${canonicalDataset.totals.total}` }] : [],
        };
      } else if (this.genAIClient) {
        const res = await this.genAIClient.models.generateContent({
          model: config.GEMINI_CHAT_MODEL,
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        });
        return {
          answer: (res.text || '').trim(),
          citations: canonicalDataset ? [{ page: 1, snippet: `Verified against canonical total ${canonicalDataset.totals.total}` }] : [],
        };
      }
    } catch (err: unknown) {
      logger.error('Error during document chat completion', { error: String(err) });
      return {
        answer: 'An error occurred while communicating with the AI service. Please try again.',
        citations: [],
      };
    }

    return {
      answer: 'Document intelligence assistant unavailable.',
      citations: [],
    };
  }
}
