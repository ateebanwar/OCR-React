export type ApiMode = 'mock' | 'backend';

export interface AppConfig {
  appName: string;
  version: string;
  apiMode: ApiMode;
  apiBaseUrl: string;
  requestTimeoutMs: number;
  maxUploadSizeBytes: number;
  features: {
    streamingChat: boolean;
    advancedSpreadsheetValidation: boolean;
    allowLocalProfiles: boolean;
  };
}

export const appConfig: AppConfig = {
  appName: 'LedgerAI Financial Intelligence Engine',
  version: '2.4.0',
  apiMode: (import.meta.env.VITE_API_MODE as ApiMode) || 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://ocr-react-chi.vercel.app',
  requestTimeoutMs: 30000,
  maxUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
  features: {
    streamingChat: false,
    advancedSpreadsheetValidation: true,
    allowLocalProfiles: true,
  },
};
