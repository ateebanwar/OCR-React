export interface ReconciliationCheck {
  id: string;
  name: string;
  description: string;
  expectedValue: number;
  calculatedValue: number;
  difference: number;
  status: 'passed' | 'warning' | 'failed';
  tolerance: number;
  details?: string;
}

export interface ReconciliationResult {
  status: 'passed' | 'warning' | 'failed';
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  checks: ReconciliationCheck[];
  summary: string;
}
