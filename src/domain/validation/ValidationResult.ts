export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationCategory =
  | 'DECIMAL_ACCURACY'
  | 'ARITHMETIC_SUBTOTAL_MISMATCH'
  | 'BALANCE_EQUATION_MISMATCH'
  | 'MISSING_REQUIRED_FIELD'
  | 'CURRENCY_MISMATCH'
  | 'DATE_FORMAT_INVALID'
  | 'DUPLICATE_ROW'
  | 'CONFIDENCE_BELOW_THRESHOLD';

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  message: string;
  explanation: string;
  field?: string;
  rowIndex?: number;
  columnKey?: string;
  sourceContext?: {
    pageNumber: number;
    extractedValue?: string | null;
    expectedValue?: string | number | null;
    foundValue?: string | number | null;
  };
}

export interface ReconciliationCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  expectedAmount: number | null;
  calculatedAmount: number | null;
  variance: number;
  currency?: string;
  formulaDescription: string;
}

export interface ValidationResult {
  isValid: boolean;
  hasWarnings: boolean;
  totalErrors: number;
  totalWarnings: number;
  issues: ValidationIssue[];
  validatedAt: string;
}

export interface ReconciliationResult {
  isReconciled: boolean;
  checks: ReconciliationCheck[];
  totalVariance: number;
  reconciledAt: string;
}
