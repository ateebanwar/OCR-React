import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_EXTRACTION_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-1.5-pro'),
  GEMINI_CHAT_MODEL: z.string().default('gemini-2.0-flash'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(25),
  REQUEST_TIMEOUT_MS: z.coerce.number().default(60000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid backend environment configuration:', parsed.error.format());
  throw new Error('Backend environment validation failed.');
}

export const config = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(',').map((s) => s.trim()),
  maxUploadSizeBytes: parsed.data.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
};

export type Config = typeof config;
