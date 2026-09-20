import { z } from 'zod';

export const CellSchema = z.object({
  columnId: z.string(),
  columnName: z.string(),
  rawValue: z.string(),
  normalizedValue: z.union([z.number(), z.string(), z.null()]),
  dataType: z.enum(['string', 'number', 'currency', 'date', 'percentage', 'boolean']),
  currency: z.string().optional(),
  confidence: z.number().min(0).max(1).default(1),
  sourceReference: z
    .object({
      page: z.number(),
      boundingBox: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
    })
    .optional(),
});

export const RowSchema = z.object({
  id: z.string(),
  rowIndex: z.number(),
  cells: z.record(z.string(), CellSchema),
  isTotalRow: z.boolean().default(false),
  isSubtotalRow: z.boolean().default(false),
  rawText: z.string().optional(),
});

export const TableSchema = z.object({
  id: z.string(),
  name: z.string().default('Financial Table'),
  pageNumber: z.number().default(1),
  columns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      dataType: z.enum(['string', 'number', 'currency', 'date', 'percentage', 'boolean']),
      currency: z.string().optional(),
    })
  ),
  rows: z.array(RowSchema),
  detectedCurrency: z.string().optional(),
});

export const MetadataSchema = z.object({
  title: z.string().optional(),
  documentType: z.enum([
    'invoice',
    'balance-sheet',
    'income-statement',
    'cash-flow',
    'bank-statement',
    'tax-document',
    'general-financial',
  ]).default('general-financial'),
  date: z.string().optional(),
  currency: z.string().default('USD'),
  pageCount: z.number().default(1),
  confidenceScore: z.number().min(0).max(1).default(0.95),
  companyName: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

export const GeminiExtractionSchema = z.object({
  metadata: MetadataSchema,
  tables: z.array(TableSchema),
  summary: z.string().optional(),
  keyMetrics: z
    .record(
      z.string(),
      z.object({
        label: z.string(),
        value: z.union([z.number(), z.string()]),
        currency: z.string().optional(),
      })
    )
    .optional(),
});

export type Cell = z.infer<typeof CellSchema>;
export type Row = z.infer<typeof RowSchema>;
export type Table = z.infer<typeof TableSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type GeminiExtraction = z.infer<typeof GeminiExtractionSchema>;
