import { ExtractedTable } from '@/domain/extraction/ExtractionResult';

export interface SampleFinancialDocDefinition {
  id: string;
  name: string;
  category: 'Income Statement' | 'Invoice' | 'Audit Report' | 'Bank Statement' | 'Validation Test' | 'Spreadsheet Analysis';
  sizeBytes: number;
  mimeType: string;
  pageCount: number;
  isScanned: boolean;
  currency: string;
  ocrQuality: 'crisp-digital' | 'scanned-clean' | 'scanned-noisy' | 'handwritten-elements';
  complexityScore: number;
  description: string;
  expectedSummary: string;
  tables: ExtractedTable[];
  isErrorSimulation?: 'network-error' | 'malformed-json';
}

export const SAMPLE_DOCUMENTS: SampleFinancialDocDefinition[] = [
  // Fixture 1: Simple Financial Statement
  {
    id: 'doc-techcorp-q4',
    name: 'TechCorp_Q4_Consolidated_Financials.pdf',
    category: 'Income Statement',
    sizeBytes: 428000,
    mimeType: 'application/pdf',
    pageCount: 4,
    isScanned: false,
    currency: 'USD',
    ocrQuality: 'crisp-digital',
    complexityScore: 4,
    description: 'Consolidated quarterly profit and loss statement with exact revenue breakdowns and tax provisions.',
    expectedSummary: 'TechCorp consolidated financials report total Q4 revenues of $1,845,000 against operating expenses of $985,000, yielding a net operating margin of 46.6%.',
    tables: [
      {
        id: 'tbl-pnl-1',
        title: 'Condensed Statement of Operations (in Thousands USD)',
        headers: ['Line Item', 'Q3 2024', 'Q4 2024', 'YoY Growth', 'Accounting Code'],
        pageNumber: 2,
        confidence: 0.98,
        rows: [
          {
            rowIndex: 0,
            pageNumber: 2,
            cells: {
              'Line Item': { rowIndex: 0, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Enterprise Software Subscriptions', confidence: 0.99, pageNumber: 2 },
              'Q3 2024': { rowIndex: 0, columnIndex: 1, columnKey: 'Q3 2024', rawValue: '1,120.00', confidence: 0.99, pageNumber: 2 },
              'Q4 2024': { rowIndex: 0, columnIndex: 2, columnKey: 'Q4 2024', rawValue: '1,310.00', confidence: 0.99, pageNumber: 2 },
              'YoY Growth': { rowIndex: 0, columnIndex: 3, columnKey: 'YoY Growth', rawValue: '+16.9%', confidence: 0.97, pageNumber: 2 },
              'Accounting Code': { rowIndex: 0, columnIndex: 4, columnKey: 'Accounting Code', rawValue: 'REV-4010', confidence: 0.99, pageNumber: 2 },
            },
          },
          {
            rowIndex: 1,
            pageNumber: 2,
            cells: {
              'Line Item': { rowIndex: 1, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Professional Implementation Services', confidence: 0.98, pageNumber: 2 },
              'Q3 2024': { rowIndex: 1, columnIndex: 1, columnKey: 'Q3 2024', rawValue: '410.00', confidence: 0.98, pageNumber: 2 },
              'Q4 2024': { rowIndex: 1, columnIndex: 2, columnKey: 'Q4 2024', rawValue: '535.00', confidence: 0.98, pageNumber: 2 },
              'YoY Growth': { rowIndex: 1, columnIndex: 3, columnKey: 'YoY Growth', rawValue: '+30.4%', confidence: 0.96, pageNumber: 2 },
              'Accounting Code': { rowIndex: 1, columnIndex: 4, columnKey: 'Accounting Code', rawValue: 'REV-4020', confidence: 0.99, pageNumber: 2 },
            },
          },
          {
            rowIndex: 2,
            pageNumber: 2,
            cells: {
              'Line Item': { rowIndex: 2, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Total Gross Revenues', confidence: 0.99, pageNumber: 2 },
              'Q3 2024': { rowIndex: 2, columnIndex: 1, columnKey: 'Q3 2024', rawValue: '1,530.00', confidence: 0.99, pageNumber: 2 },
              'Q4 2024': { rowIndex: 2, columnIndex: 2, columnKey: 'Q4 2024', rawValue: '1,845.00', confidence: 0.99, pageNumber: 2 },
              'YoY Growth': { rowIndex: 2, columnIndex: 3, columnKey: 'YoY Growth', rawValue: '+20.5%', confidence: 0.98, pageNumber: 2 },
              'Accounting Code': { rowIndex: 2, columnIndex: 4, columnKey: 'Accounting Code', rawValue: 'REV-TOTAL', confidence: 0.99, pageNumber: 2 },
            },
          },
          {
            rowIndex: 3,
            pageNumber: 2,
            cells: {
              'Line Item': { rowIndex: 3, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Research & Development Expenses', confidence: 0.97, pageNumber: 2 },
              'Q3 2024': { rowIndex: 3, columnIndex: 1, columnKey: 'Q3 2024', rawValue: '480.00', confidence: 0.98, pageNumber: 2 },
              'Q4 2024': { rowIndex: 3, columnIndex: 2, columnKey: 'Q4 2024', rawValue: '510.00', confidence: 0.98, pageNumber: 2 },
              'YoY Growth': { rowIndex: 3, columnIndex: 3, columnKey: 'YoY Growth', rawValue: '+6.2%', confidence: 0.95, pageNumber: 2 },
              'Accounting Code': { rowIndex: 3, columnIndex: 4, columnKey: 'Accounting Code', rawValue: 'EXP-5010', confidence: 0.99, pageNumber: 2 },
            },
          },
          {
            rowIndex: 4,
            pageNumber: 2,
            cells: {
              'Line Item': { rowIndex: 4, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Sales & General Marketing', confidence: 0.98, pageNumber: 2 },
              'Q3 2024': { rowIndex: 4, columnIndex: 1, columnKey: 'Q3 2024', rawValue: '390.00', confidence: 0.97, pageNumber: 2 },
              'Q4 2024': { rowIndex: 4, columnIndex: 2, columnKey: 'Q4 2024', rawValue: '475.00', confidence: 0.97, pageNumber: 2 },
              'YoY Growth': { rowIndex: 4, columnIndex: 3, columnKey: 'YoY Growth', rawValue: '+21.7%', confidence: 0.94, pageNumber: 2 },
              'Accounting Code': { rowIndex: 4, columnIndex: 4, columnKey: 'Accounting Code', rawValue: 'EXP-5020', confidence: 0.99, pageNumber: 2 },
            },
          },
          {
            rowIndex: 5,
            pageNumber: 2,
            cells: {
              'Line Item': { rowIndex: 5, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Total Operating Expenses', confidence: 0.99, pageNumber: 2 },
              'Q3 2024': { rowIndex: 5, columnIndex: 1, columnKey: 'Q3 2024', rawValue: '870.00', confidence: 0.99, pageNumber: 2 },
              'Q4 2024': { rowIndex: 5, columnIndex: 2, columnKey: 'Q4 2024', rawValue: '985.00', confidence: 0.99, pageNumber: 2 },
              'YoY Growth': { rowIndex: 5, columnIndex: 3, columnKey: 'YoY Growth', rawValue: '+13.2%', confidence: 0.97, pageNumber: 2 },
              'Accounting Code': { rowIndex: 5, columnIndex: 4, columnKey: 'Accounting Code', rawValue: 'EXP-TOTAL', confidence: 0.99, pageNumber: 2 },
            },
          },
        ],
      },
    ],
  },

  // Fixture 2: Multi-Table Financial Document
  {
    id: 'doc-apex-invoice',
    name: 'Apex_Global_Logistics_Inv9044.pdf',
    category: 'Invoice',
    sizeBytes: 285000,
    mimeType: 'application/pdf',
    pageCount: 2,
    isScanned: false,
    currency: 'EUR',
    ocrQuality: 'crisp-digital',
    complexityScore: 3,
    description: 'European freight and intermodal logistics tax invoice with itemized line items and VAT.',
    expectedSummary: 'Apex Global Logistics itemized invoice #9044 totals €14,880.00 inclusive of €2,480.00 VAT across 5 intermodal transit segments.',
    tables: [
      {
        id: 'tbl-invoice-items',
        title: 'Itemized Logistics Transit Schedule',
        headers: ['Item Description', 'Tracking Ref', 'Quantity', 'Unit Rate (€)', 'Net Amount (€)'],
        pageNumber: 1,
        confidence: 0.99,
        rows: [
          {
            rowIndex: 0,
            pageNumber: 1,
            cells: {
              'Item Description': { rowIndex: 0, columnIndex: 0, columnKey: 'Item Description', rawValue: 'Rotterdam Port Drayage & Container Handling', confidence: 0.99, pageNumber: 1 },
              'Tracking Ref': { rowIndex: 0, columnIndex: 1, columnKey: 'Tracking Ref', rawValue: 'TRK-8801', confidence: 0.99, pageNumber: 1 },
              'Quantity': { rowIndex: 0, columnIndex: 2, columnKey: 'Quantity', rawValue: '4', confidence: 0.99, pageNumber: 1 },
              'Unit Rate (€)': { rowIndex: 0, columnIndex: 3, columnKey: 'Unit Rate (€)', rawValue: '650.00', confidence: 0.99, pageNumber: 1 },
              'Net Amount (€)': { rowIndex: 0, columnIndex: 4, columnKey: 'Net Amount (€)', rawValue: '2,600.00', confidence: 0.99, pageNumber: 1 },
            },
          },
          {
            rowIndex: 1,
            pageNumber: 1,
            cells: {
              'Item Description': { rowIndex: 1, columnIndex: 0, columnKey: 'Item Description', rawValue: 'Rhine Corridor Rail Freight - 40ft TEU', confidence: 0.98, pageNumber: 1 },
              'Tracking Ref': { rowIndex: 1, columnIndex: 1, columnKey: 'Tracking Ref', rawValue: 'TRK-8809', confidence: 0.99, pageNumber: 1 },
              'Quantity': { rowIndex: 1, columnIndex: 2, columnKey: 'Quantity', rawValue: '4', confidence: 0.99, pageNumber: 1 },
              'Unit Rate (€)': { rowIndex: 1, columnIndex: 3, columnKey: 'Unit Rate (€)', rawValue: '1,850.00', confidence: 0.99, pageNumber: 1 },
              'Net Amount (€)': { rowIndex: 1, columnIndex: 4, columnKey: 'Net Amount (€)', rawValue: '7,400.00', confidence: 0.99, pageNumber: 1 },
            },
          },
          {
            rowIndex: 2,
            pageNumber: 1,
            cells: {
              'Item Description': { rowIndex: 2, columnIndex: 0, columnKey: 'Item Description', rawValue: 'Subtotal Net Services', confidence: 0.99, pageNumber: 1 },
              'Tracking Ref': { rowIndex: 2, columnIndex: 1, columnKey: 'Tracking Ref', rawValue: 'SUB-TOTAL', confidence: 0.99, pageNumber: 1 },
              'Quantity': { rowIndex: 2, columnIndex: 2, columnKey: 'Quantity', rawValue: '8', confidence: 0.99, pageNumber: 1 },
              'Unit Rate (€)': { rowIndex: 2, columnIndex: 3, columnKey: 'Unit Rate (€)', rawValue: '—', confidence: 0.99, pageNumber: 1 },
              'Net Amount (€)': { rowIndex: 2, columnIndex: 4, columnKey: 'Net Amount (€)', rawValue: '10,000.00', confidence: 0.99, pageNumber: 1 },
            },
          },
          {
            rowIndex: 3,
            pageNumber: 1,
            cells: {
              'Item Description': { rowIndex: 3, columnIndex: 0, columnKey: 'Item Description', rawValue: 'VAT Tax (20.00%)', confidence: 0.99, pageNumber: 1 },
              'Tracking Ref': { rowIndex: 3, columnIndex: 1, columnKey: 'Tracking Ref', rawValue: 'TAX-VAT', confidence: 0.99, pageNumber: 1 },
              'Quantity': { rowIndex: 3, columnIndex: 2, columnKey: 'Quantity', rawValue: '1', confidence: 0.99, pageNumber: 1 },
              'Unit Rate (€)': { rowIndex: 3, columnIndex: 3, columnKey: 'Unit Rate (€)', rawValue: '2,000.00', confidence: 0.99, pageNumber: 1 },
              'Net Amount (€)': { rowIndex: 3, columnIndex: 4, columnKey: 'Net Amount (€)', rawValue: '2,000.00', confidence: 0.99, pageNumber: 1 },
            },
          },
          {
            rowIndex: 4,
            pageNumber: 1,
            cells: {
              'Item Description': { rowIndex: 4, columnIndex: 0, columnKey: 'Item Description', rawValue: 'Total Due and Payable', confidence: 0.99, pageNumber: 1 },
              'Tracking Ref': { rowIndex: 4, columnIndex: 1, columnKey: 'Tracking Ref', rawValue: 'INV-TOTAL', confidence: 0.99, pageNumber: 1 },
              'Quantity': { rowIndex: 4, columnIndex: 2, columnKey: 'Quantity', rawValue: '9', confidence: 0.99, pageNumber: 1 },
              'Unit Rate (€)': { rowIndex: 4, columnIndex: 3, columnKey: 'Unit Rate (€)', rawValue: '—', confidence: 0.99, pageNumber: 1 },
              'Net Amount (€)': { rowIndex: 4, columnIndex: 4, columnKey: 'Net Amount (€)', rawValue: '12,000.00', confidence: 0.99, pageNumber: 1 },
            },
          },
        ],
      },
    ],
  },

  // Fixture 3: Complex Scanned Document
  {
    id: 'doc-vertex-bank-stmt',
    name: 'Vertex_Holdings_Bank_Statement_Scanned.pdf',
    category: 'Bank Statement',
    sizeBytes: 890000,
    mimeType: 'application/pdf',
    pageCount: 3,
    isScanned: true,
    currency: 'INR',
    ocrQuality: 'scanned-noisy',
    complexityScore: 8,
    description: 'Scanned corporate bank ledger with ₹ Indian Rupee debit/credit cashflows and opening/closing reconciliation.',
    expectedSummary: 'Vertex Holdings corporate current account shows opening balance of ₹1,250,000.00 and closing balance of ₹2,840,000.00.',
    tables: [
      {
        id: 'tbl-bank-ledger',
        title: 'Statement of Account - Commercial Ledger (₹ INR)',
        headers: ['Value Date', 'Particulars / Description', 'Reference No', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)'],
        pageNumber: 1,
        confidence: 0.88,
        rows: [
          {
            rowIndex: 0,
            pageNumber: 1,
            cells: {
              'Value Date': { rowIndex: 0, columnIndex: 0, columnKey: 'Value Date', rawValue: '01/10/2024', confidence: 0.92, pageNumber: 1 },
              'Particulars / Description': { rowIndex: 0, columnIndex: 1, columnKey: 'Particulars / Description', rawValue: 'OPENING BALANCE B/F', confidence: 0.95, pageNumber: 1 },
              'Reference No': { rowIndex: 0, columnIndex: 2, columnKey: 'Reference No', rawValue: 'OB-001', confidence: 0.90, pageNumber: 1 },
              'Debit (₹)': { rowIndex: 0, columnIndex: 3, columnKey: 'Debit (₹)', rawValue: '—', confidence: 0.90, pageNumber: 1 },
              'Credit (₹)': { rowIndex: 0, columnIndex: 4, columnKey: 'Credit (₹)', rawValue: '—', confidence: 0.90, pageNumber: 1 },
              'Balance (₹)': { rowIndex: 0, columnIndex: 5, columnKey: 'Balance (₹)', rawValue: '1,250,000.00', confidence: 0.94, pageNumber: 1 },
            },
          },
          {
            rowIndex: 1,
            pageNumber: 1,
            cells: {
              'Value Date': { rowIndex: 1, columnIndex: 0, columnKey: 'Value Date', rawValue: '04/10/2024', confidence: 0.89, pageNumber: 1 },
              'Particulars / Description': { rowIndex: 1, columnIndex: 1, columnKey: 'Particulars / Description', rawValue: 'NEFT CR: TATA CONSULTANCY SERVICES', confidence: 0.87, pageNumber: 1 },
              'Reference No': { rowIndex: 1, columnIndex: 2, columnKey: 'Reference No', rawValue: 'AXIS-N99281', confidence: 0.85, pageNumber: 1 },
              'Debit (₹)': { rowIndex: 1, columnIndex: 3, columnKey: 'Debit (₹)', rawValue: '—', confidence: 0.90, pageNumber: 1 },
              'Credit (₹)': { rowIndex: 1, columnIndex: 4, columnKey: 'Credit (₹)', rawValue: '2,100,000.00', confidence: 0.89, pageNumber: 1 },
              'Balance (₹)': { rowIndex: 1, columnIndex: 5, columnKey: 'Balance (₹)', rawValue: '3,350,000.00', confidence: 0.89, pageNumber: 1 },
            },
          },
          {
            rowIndex: 2,
            pageNumber: 1,
            cells: {
              'Value Date': { rowIndex: 2, columnIndex: 0, columnKey: 'Value Date', rawValue: '12/10/2024', confidence: 0.88, pageNumber: 1 },
              'Particulars / Description': { rowIndex: 2, columnIndex: 1, columnKey: 'Particulars / Description', rawValue: 'RTGS DR: HDFC PROPERTY LEASE RENT', confidence: 0.86, pageNumber: 1 },
              'Reference No': { rowIndex: 2, columnIndex: 2, columnKey: 'Reference No', rawValue: 'RTGS-44018', confidence: 0.84, pageNumber: 1 },
              'Debit (₹)': { rowIndex: 2, columnIndex: 3, columnKey: 'Debit (₹)', rawValue: '510,000.00', confidence: 0.88, pageNumber: 1 },
              'Credit (₹)': { rowIndex: 2, columnIndex: 4, columnKey: 'Credit (₹)', rawValue: '—', confidence: 0.90, pageNumber: 1 },
              'Balance (₹)': { rowIndex: 2, columnIndex: 5, columnKey: 'Balance (₹)', rawValue: '2,840,000.00', confidence: 0.89, pageNumber: 1 },
            },
          },
        ],
      },
    ],
  },

  // Fixture 4: Validation Failure Test Document
  {
    id: 'doc-validation-failure',
    name: 'OmniCorp_Corrupted_Invoice_Validation_Fail.pdf',
    category: 'Validation Test',
    sizeBytes: 154000,
    mimeType: 'application/pdf',
    pageCount: 1,
    isScanned: false,
    currency: 'USD',
    ocrQuality: 'crisp-digital',
    complexityScore: 5,
    description: 'Corrupted invoice missing required headers and exhibiting invalid non-numeric text in monetary cells to test deterministic error detection.',
    expectedSummary: 'Validation failure: 2 cell-level data type errors identified.',
    tables: [
      {
        id: 'tbl-invalid-data',
        title: 'Corrupted Ledger Entries',
        headers: ['Line Item', 'Amount ($)'],
        pageNumber: 1,
        confidence: 0.65,
        rows: [
          {
            rowIndex: 0,
            pageNumber: 1,
            cells: {
              'Line Item': { rowIndex: 0, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Server Infrastructure', confidence: 0.9, pageNumber: 1 },
              'Amount ($)': { rowIndex: 0, columnIndex: 1, columnKey: 'Amount ($)', rawValue: 'INVALID_DECIMAL_TEXT', confidence: 0.5, pageNumber: 1 },
            },
          },
          {
            rowIndex: 1,
            pageNumber: 1,
            cells: {
              'Line Item': { rowIndex: 1, columnIndex: 0, columnKey: 'Line Item', rawValue: 'Total Stated', confidence: 0.9, pageNumber: 1 },
              'Amount ($)': { rowIndex: 1, columnIndex: 1, columnKey: 'Amount ($)', rawValue: 'UNKNOWN_NaN', confidence: 0.4, pageNumber: 1 },
            },
          },
        ],
      },
    ],
  },

  // Fixture 5: Reconciliation Failure (Arithmetic Discrepancy)
  {
    id: 'doc-meridian-audit-issue',
    name: 'Meridian_Healthcare_Audit_Discrepancy.pdf',
    category: 'Audit Report',
    sizeBytes: 612000,
    mimeType: 'application/pdf',
    pageCount: 6,
    isScanned: false,
    currency: 'USD',
    ocrQuality: 'crisp-digital',
    complexityScore: 7,
    description: 'Healthcare draft operating budget exhibiting a $15,000 arithmetic discrepancy in the lab supplies subtotal to trigger audit warnings.',
    expectedSummary: 'Draft budget for Meridian Healthcare has an active audit flag: Stated Total Expenses is $325,000, but sum of line items calculates to $340,000 ($15,000 variance).',
    tables: [
      {
        id: 'tbl-meridian-budget',
        title: 'Departmental Expenditure Breakdown',
        headers: ['Department', 'Budget Code', 'Allocated Amount ($)', 'Expended ($)', 'Variance ($)'],
        pageNumber: 3,
        confidence: 0.94,
        rows: [
          {
            rowIndex: 0,
            pageNumber: 3,
            cells: {
              'Department': { rowIndex: 0, columnIndex: 0, columnKey: 'Department', rawValue: 'Clinical Pathology Supplies', confidence: 0.95, pageNumber: 3 },
              'Budget Code': { rowIndex: 0, columnIndex: 1, columnKey: 'Budget Code', rawValue: 'MED-101', confidence: 0.98, pageNumber: 3 },
              'Allocated Amount ($)': { rowIndex: 0, columnIndex: 2, columnKey: 'Allocated Amount ($)', rawValue: '120,000.00', confidence: 0.96, pageNumber: 3 },
              'Expended ($)': { rowIndex: 0, columnIndex: 3, columnKey: 'Expended ($)', rawValue: '115,000.00', confidence: 0.96, pageNumber: 3 },
              'Variance ($)': { rowIndex: 0, columnIndex: 4, columnKey: 'Variance ($)', rawValue: '5,000.00', confidence: 0.94, pageNumber: 3 },
            },
          },
          {
            rowIndex: 1,
            pageNumber: 3,
            cells: {
              'Department': { rowIndex: 1, columnIndex: 0, columnKey: 'Department', rawValue: 'Diagnostic Imaging Reagents', confidence: 0.95, pageNumber: 3 },
              'Budget Code': { rowIndex: 1, columnIndex: 1, columnKey: 'Budget Code', rawValue: 'MED-102', confidence: 0.97, pageNumber: 3 },
              'Allocated Amount ($)': { rowIndex: 1, columnIndex: 2, columnKey: 'Allocated Amount ($)', rawValue: '140,000.00', confidence: 0.96, pageNumber: 3 },
              'Expended ($)': { rowIndex: 1, columnIndex: 3, columnKey: 'Expended ($)', rawValue: '155,000.00', confidence: 0.96, pageNumber: 3 },
              'Variance ($)': { rowIndex: 1, columnIndex: 4, columnKey: 'Variance ($)', rawValue: '(15,000.00)', confidence: 0.93, pageNumber: 3 },
            },
          },
          {
            rowIndex: 2,
            pageNumber: 3,
            cells: {
              'Department': { rowIndex: 2, columnIndex: 0, columnKey: 'Department', rawValue: 'Emergency Triage Equipment', confidence: 0.93, pageNumber: 3 },
              'Budget Code': { rowIndex: 2, columnIndex: 1, columnKey: 'Budget Code', rawValue: 'MED-103', confidence: 0.96, pageNumber: 3 },
              'Allocated Amount ($)': { rowIndex: 2, columnIndex: 2, columnKey: 'Allocated Amount ($)', rawValue: '80,000.00', confidence: 0.94, pageNumber: 3 },
              'Expended ($)': { rowIndex: 2, columnIndex: 3, columnKey: 'Expended ($)', rawValue: '70,000.00', confidence: 0.94, pageNumber: 3 },
              'Variance ($)': { rowIndex: 2, columnIndex: 4, columnKey: 'Variance ($)', rawValue: '10,000.00', confidence: 0.93, pageNumber: 3 },
            },
          },
          {
            rowIndex: 3,
            pageNumber: 3,
            cells: {
              // Intentional Discrepancy: Expended sum is 115k + 155k + 70k = 340k, but row lists 325k
              'Department': { rowIndex: 3, columnIndex: 0, columnKey: 'Department', rawValue: 'Total Department Operations', confidence: 0.92, pageNumber: 3 },
              'Budget Code': { rowIndex: 3, columnIndex: 1, columnKey: 'Budget Code', rawValue: 'MED-TOTAL', confidence: 0.99, pageNumber: 3 },
              'Allocated Amount ($)': { rowIndex: 3, columnIndex: 2, columnKey: 'Allocated Amount ($)', rawValue: '340,000.00', confidence: 0.98, pageNumber: 3 },
              'Expended ($)': { rowIndex: 3, columnIndex: 3, columnKey: 'Expended ($)', rawValue: '325,000.00', confidence: 0.98, pageNumber: 3 },
              'Variance ($)': { rowIndex: 3, columnIndex: 4, columnKey: 'Variance ($)', rawValue: '15,000.00', confidence: 0.90, pageNumber: 3 },
            },
          },
        ],
      },
    ],
  },

  // Fixture 6: Network Failure Simulation
  {
    id: 'doc-network-failure',
    name: 'Simulated_Network_Timeout_Error.pdf',
    category: 'Validation Test',
    sizeBytes: 120000,
    mimeType: 'application/pdf',
    pageCount: 1,
    isScanned: false,
    currency: 'USD',
    ocrQuality: 'crisp-digital',
    complexityScore: 5,
    description: 'Special fixture that deterministically triggers a simulated network timeout to test frontend error recovery and retry states.',
    expectedSummary: 'Simulated connection failure',
    isErrorSimulation: 'network-error',
    tables: [],
  },

  // Fixture 7: Malformed Extraction Simulation
  {
    id: 'doc-malformed-response',
    name: 'Simulated_Malformed_AI_Payload.pdf',
    category: 'Validation Test',
    sizeBytes: 95000,
    mimeType: 'application/pdf',
    pageCount: 1,
    isScanned: false,
    currency: 'USD',
    ocrQuality: 'crisp-digital',
    complexityScore: 5,
    description: 'Simulates an untrusted AI response that returned unparseable schema elements to test strict frontend boundary validation.',
    expectedSummary: 'Simulated malformed payload',
    isErrorSimulation: 'malformed-json',
    tables: [],
  },

  // Fixture 8: Existing Spreadsheet Analysis
  {
    id: 'doc-existing-spreadsheet',
    name: 'Quarterly_Balance_Sheet_Existing.xlsx',
    category: 'Spreadsheet Analysis',
    sizeBytes: 310000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pageCount: 1,
    isScanned: false,
    currency: 'USD',
    ocrQuality: 'crisp-digital',
    complexityScore: 4,
    description: 'Pre-existing corporate Excel balance sheet ingested directly into the Canonical Dataset engine for verification and inquiry.',
    expectedSummary: 'Balance sheet reconciliation confirms Total Assets ($4,250,000) equal Total Liabilities ($2,100,000) plus Equity ($2,150,000).',
    tables: [
      {
        id: 'tbl-balance-sheet',
        title: 'Consolidated Balance Sheet',
        headers: ['Classification', 'Account Category', 'Carrying Value ($)'],
        pageNumber: 1,
        confidence: 1.0,
        rows: [
          {
            rowIndex: 0,
            pageNumber: 1,
            cells: {
              'Classification': { rowIndex: 0, columnIndex: 0, columnKey: 'Classification', rawValue: 'Current Assets', confidence: 1.0, pageNumber: 1 },
              'Account Category': { rowIndex: 0, columnIndex: 1, columnKey: 'Account Category', rawValue: 'Cash & Short-Term Liquid Equivalents', confidence: 1.0, pageNumber: 1 },
              'Carrying Value ($)': { rowIndex: 0, columnIndex: 2, columnKey: 'Carrying Value ($)', rawValue: '1,850,000.00', confidence: 1.0, pageNumber: 1 },
            },
          },
          {
            rowIndex: 1,
            pageNumber: 1,
            cells: {
              'Classification': { rowIndex: 1, columnIndex: 0, columnKey: 'Classification', rawValue: 'Non-Current Assets', confidence: 1.0, pageNumber: 1 },
              'Account Category': { rowIndex: 1, columnIndex: 1, columnKey: 'Account Category', rawValue: 'Property, Plant & Equipment (Net)', confidence: 1.0, pageNumber: 1 },
              'Carrying Value ($)': { rowIndex: 1, columnIndex: 2, columnKey: 'Carrying Value ($)', rawValue: '2,400,000.00', confidence: 1.0, pageNumber: 1 },
            },
          },
          {
            rowIndex: 2,
            pageNumber: 1,
            cells: {
              'Classification': { rowIndex: 2, columnIndex: 0, columnKey: 'Classification', rawValue: 'Total Asset Base', confidence: 1.0, pageNumber: 1 },
              'Account Category': { rowIndex: 2, columnIndex: 1, columnKey: 'Account Category', rawValue: 'Total Stated Assets', confidence: 1.0, pageNumber: 1 },
              'Carrying Value ($)': { rowIndex: 2, columnIndex: 2, columnKey: 'Carrying Value ($)', rawValue: '4,250,000.00', confidence: 1.0, pageNumber: 1 },
            },
          },
        ],
      },
    ],
  },
];
