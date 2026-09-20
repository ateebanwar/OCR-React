export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  tableId?: string;
  rowId?: string;
  columnId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  checkedRules: string[];
  deterministicSummary: {
    totalRows: number;
    totalColumns: number;
    emptyCells: number;
    numericCells: number;
    anomaliesFound: number;
  };
}
