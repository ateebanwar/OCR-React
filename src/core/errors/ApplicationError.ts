export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'RECONCILIATION_ERROR'
  | 'PROCESSING_ERROR'
  | 'UNSUPPORTED_FILE_ERROR'
  | 'AI_PROVIDER_ERROR'
  | 'SPREADSHEET_GENERATION_ERROR'
  | 'SESSION_NOT_FOUND'
  | 'UNKNOWN_APPLICATION_ERROR';

export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly userMessage: string;
  public readonly timestamp: number;

  constructor(params: {
    code: ErrorCode;
    message: string;
    userMessage?: string;
    details?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = 'ApplicationError';
    this.code = params.code;
    this.userMessage = params.userMessage ?? params.message;
    this.details = params.details;
    this.timestamp = Date.now();
    if (params.cause) {
      this.cause = params.cause;
    }
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      userMessage: 'The document data did not satisfy financial validation rules.',
      details,
    });
    this.name = 'ValidationError';
  }
}

export class UnsupportedFileError extends ApplicationError {
  constructor(filename: string, format: string) {
    super({
      code: 'UNSUPPORTED_FILE_ERROR',
      message: `File "${filename}" with format "${format}" is not supported.`,
      userMessage: `Please upload a valid PDF, XLSX, or CSV document.`,
      details: { filename, format },
    });
    this.name = 'UnsupportedFileError';
  }
}

export class SpreadsheetGenerationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: 'SPREADSHEET_GENERATION_ERROR',
      message,
      userMessage: 'An error occurred while generating the Excel spreadsheet workbook.',
      details,
    });
    this.name = 'SpreadsheetGenerationError';
  }
}
