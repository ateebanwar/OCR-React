import { Table, Metadata } from '../../src/schemas/extraction.schema.js';
import { CanonicalDataset } from '../../src/domain/dataset/CanonicalDataset.js';

export const mockSimpleMetadata: Metadata = {
  title: 'Quarterly Operating Invoice',
  documentType: 'invoice',
  date: '2026-03-15',
  currency: 'USD',
  pageCount: 1,
  confidenceScore: 0.98,
  companyName: 'Apex Data Technologies',
  invoiceNumber: 'INV-2026-8841',
};

export const mockSimpleTable: Table = {
  id: 'tbl-simple',
  name: 'Services Rendered',
  pageNumber: 1,
  columns: [
    { id: 'col-desc', name: 'Description', dataType: 'string' },
    { id: 'col-qty', name: 'Quantity', dataType: 'number' },
    { id: 'col-rate', name: 'Unit Price', dataType: 'currency' },
    { id: 'col-total', name: 'Line Total', dataType: 'currency' },
  ],
  rows: [
    {
      id: 'row-1',
      rowIndex: 1,
      isTotalRow: false,
      isSubtotalRow: false,
      cells: {
        'col-desc': { columnId: 'col-desc', columnName: 'Description', rawValue: 'AI Model Fine-Tuning Service', normalizedValue: 'AI Model Fine-Tuning Service', dataType: 'string', confidence: 1 },
        'col-qty': { columnId: 'col-qty', columnName: 'Quantity', rawValue: '40', normalizedValue: 40, dataType: 'number', confidence: 1 },
        'col-rate': { columnId: 'col-rate', columnName: 'Unit Price', rawValue: '$150.00', normalizedValue: 150.00, dataType: 'currency', confidence: 1 },
        'col-total': { columnId: 'col-total', columnName: 'Line Total', rawValue: '$6,000.00', normalizedValue: 6000.00, dataType: 'currency', confidence: 1 },
      },
    },
    {
      id: 'row-2',
      rowIndex: 2,
      isTotalRow: false,
      isSubtotalRow: false,
      cells: {
        'col-desc': { columnId: 'col-desc', columnName: 'Description', rawValue: 'Dedicated Security Audit Review', normalizedValue: 'Dedicated Security Audit Review', dataType: 'string', confidence: 1 },
        'col-qty': { columnId: 'col-qty', columnName: 'Quantity', rawValue: '1', normalizedValue: 1, dataType: 'number', confidence: 1 },
        'col-rate': { columnId: 'col-rate', columnName: 'Unit Price', rawValue: '$2,500.00', normalizedValue: 2500.00, dataType: 'currency', confidence: 1 },
        'col-total': { columnId: 'col-total', columnName: 'Line Total', rawValue: '$2,500.00', normalizedValue: 2500.00, dataType: 'currency', confidence: 1 },
      },
    },
  ],
};

export const mockSimpleCanonicalDataset: CanonicalDataset = {
  id: 'ds-simple-test',
  documentId: 'doc-simple-test',
  processingId: 'proc-simple-test',
  createdAt: '2026-03-15T12:00:00Z',
  metadata: mockSimpleMetadata,
  tables: [mockSimpleTable],
  totals: {
    subtotal: 8500.00,
    tax: 680.00,
    total: 9180.00,
    currency: 'USD',
    rowCount: 2,
    columnCount: 4,
  },
  summary: 'Quarterly Operating Invoice for Apex Data Technologies totaling 9,180.00 USD.',
  validationStatus: 'passed',
  reconciliationStatus: 'passed',
};
