import { AIProvider, DocumentAnalysisReport, ChatAnswerResponse, ProcessingStageCallback } from './AIProvider';
import { Document } from '@/domain/document/Document';
import { ExtractionResult } from '@/domain/extraction/ExtractionResult';
import { ChatMessage, MessageCitation } from '@/domain/conversation/Conversation';
import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';
import { SAMPLE_DOCUMENTS, SampleFinancialDocDefinition } from './fixtures/sampleDocuments';

export class MockAIProvider implements AIProvider {
  public readonly providerName = 'MockFinancialAI (Gemini Simulation)';

  private findMatchingFixture(filename: string): SampleFinancialDocDefinition {
    const lower = filename.toLowerCase();
    if (lower.includes('network') || lower.includes('timeout')) {
      return SAMPLE_DOCUMENTS[5]!; // Network failure simulation
    }
    if (lower.includes('malformed') || lower.includes('payload')) {
      return SAMPLE_DOCUMENTS[6]!; // Malformed response simulation
    }
    if (lower.includes('corrupt') || lower.includes('omnicorp') || lower.includes('validation_fail')) {
      return SAMPLE_DOCUMENTS[3]!; // Validation failure test
    }
    if (lower.includes('meridian') || lower.includes('discrepancy') || lower.includes('audit')) {
      return SAMPLE_DOCUMENTS[4]!; // Reconciliation discrepancy
    }
    if (lower.includes('balance') || lower.includes('existing') || lower.includes('xlsx')) {
      return SAMPLE_DOCUMENTS[7]!; // Existing spreadsheet analysis
    }
    if (lower.includes('invoice') || lower.includes('apex') || lower.includes('eur')) {
      return SAMPLE_DOCUMENTS[1]!; // Multi-table invoice
    }
    if (lower.includes('bank') || lower.includes('vertex') || lower.includes('statement') || lower.includes('inr')) {
      return SAMPLE_DOCUMENTS[2]!; // Scanned multi-currency statement
    }
    // Default to TechCorp Q4 statement
    return SAMPLE_DOCUMENTS[0]!;
  }

  public async analyzeDocument(
    file: File | { name: string; size: number },
    signal?: AbortSignal
  ): Promise<DocumentAnalysisReport> {
    // Simulate short network analysis delay
    await this.delay(450, signal);

    const fixture = this.findMatchingFixture(file.name);
    return {
      isScanned: fixture.isScanned,
      pageCount: fixture.pageCount,
      detectedCurrencies: [fixture.currency],
      estimatedTableCount: fixture.tables.length,
      ocrQuality: fixture.ocrQuality,
      recommendedModel: fixture.complexityScore > 5 ? 'Gemini 1.5 Pro (Financial Specialist)' : 'Gemini 2.5 Flash',
      complexityScore: fixture.complexityScore,
    };
  }

  public async extractStructuredData(
    document: Document,
    _report: DocumentAnalysisReport,
    onProgress?: ProcessingStageCallback,
    signal?: AbortSignal
  ): Promise<ExtractionResult> {
    const fixture = this.findMatchingFixture(document.name);

    if (fixture.isErrorSimulation === 'network-error') {
      await this.delay(500, signal);
      throw new Error('Connection to the remote document intelligence engine timed out (Simulated Network Failure)');
    }

    if (fixture.isErrorSimulation === 'malformed-json') {
      await this.delay(500, signal);
      throw new Error('AI Provider returned malformed JSON schema missing mandatory table structural keys');
    }

    // Semantic progress emission (No fake percentages, semantic milestones)
    if (onProgress) {
      onProgress('Document Ingested & Pre-processed', 15, 'Vectorizing document layout and layout boundaries');
      await this.delay(350, signal);
      onProgress('OCR & Document Layout Analysis', 35, `Analyzing ${fixture.pageCount} pages, layout quality: ${fixture.ocrQuality}`);
      await this.delay(400, signal);
      onProgress('Financial Table Extraction', 65, `Extracted ${fixture.tables.length} tables and ${fixture.tables[0]?.rows.length ?? 0} rows`);
      await this.delay(400, signal);
      onProgress('Raw Model Extraction Complete', 85, 'Awaiting schema parsing and deterministic validation');
      await this.delay(300, signal);
    }

    return {
      documentId: document.id,
      extractedAt: new Date().toISOString(),
      modelName: _report.recommendedModel,
      overallConfidence: fixture.tables[0]?.confidence ?? 0.95,
      fields: [
        { key: 'DocumentType', label: 'Document Classification', rawValue: fixture.category, confidence: 0.99, pageNumber: 1 },
        { key: 'DetectedCurrency', label: 'Primary Currency', rawValue: fixture.currency, confidence: 0.99, pageNumber: 1 },
        { key: 'ReportingEntity', label: 'Entity / Vendor', rawValue: fixture.name.split('_')[0], confidence: 0.98, pageNumber: 1 },
      ],
      tables: fixture.tables,
    };
  }

  public async answerDocumentQuestion(
    question: string,
    canonicalDataset: CanonicalDataset | null,
    _history: ChatMessage[],
    signal?: AbortSignal
  ): Promise<ChatAnswerResponse> {
    await this.delay(650, signal);

    if (!canonicalDataset) {
      return {
        answer: "I am ready to assist you. Please upload or select a financial document first so I can inspect its verified canonical dataset.",
        citations: [],
        suggestedFollowUps: ['Upload Q4 Statement', 'Upload Vendor Invoice', 'How does validation work?'],
      };
    }

    const q = question.toLowerCase();
    const citations: MessageCitation[] = [];

    // Query analysis against canonical dataset
    if (q.includes('total') || q.includes('revenue') || q.includes('amount') || q.includes('sum')) {
      const totalRow = canonicalDataset.rows.find((r) => r.isTotal || r.cells['Line Item']?.displayValue?.toLowerCase().includes('total'));
      if (totalRow) {
        const val = totalRow.cells['Q4 2024']?.displayValue ?? totalRow.cells['Net Amount (€)']?.displayValue ?? totalRow.cells['Expended ($)']?.displayValue ?? 'available in canonical summary';
        citations.push({
          id: 'cite-1',
          label: `Row #${totalRow.rowNumber}`,
          rowId: totalRow.rowId,
          pageNumber: totalRow.pageNumber,
          cellDisplayValue: val,
          sourceText: `Total stated in row: ${val}`,
        });
        return {
          answer: `Based on verified **Row #${totalRow.rowNumber}** of the canonical dataset, the stated total is **${val}** (${canonicalDataset.totals.currencyDetected}). Deterministic verification confirmed arithmetic integrity across all upstream line items.`,
          citations,
          suggestedFollowUps: ['Show line item breakdown', 'Are there any validation warnings?', 'Generate Excel file'],
        };
      }
    }

    if (q.includes('row') || q.includes('how many') || q.includes('count')) {
      return {
        answer: `The canonical dataset contains **${canonicalDataset.totals.rowCount} extracted rows** across **${canonicalDataset.totals.columnCount} columns** in table "${canonicalDataset.title}".`,
        citations: [],
        suggestedFollowUps: ['What is the highest value?', 'Check reconciliation', 'Download as XLSX'],
      };
    }

    if (q.includes('validation') || q.includes('audit') || q.includes('reconcil') || q.includes('warning') || q.includes('error')) {
      const issues = canonicalDataset.validation.issues;
      if (issues.length === 0) {
        return {
          answer: `All deterministic financial validation checks **passed with 0 errors and 0 warnings**. Row sums match stated subtotals and currency indicators are consistent.`,
          citations: [],
          suggestedFollowUps: ['Download verified Excel', 'Inspect totals', 'Summarize operations'],
        };
      } else {
        const issue = issues[0]!;
        return {
          answer: `Financial audit identified **${issues.length} flag(s)**:\n- **${issue.category}** (Severity: ${issue.severity.toUpperCase()}): ${issue.message}. ${issue.explanation}`,
          citations: issue.rowIndex !== undefined ? [{
            id: 'cite-issue',
            label: `Row #${issue.rowIndex + 1}`,
            pageNumber: issue.sourceContext?.pageNumber,
            cellDisplayValue: String(issue.sourceContext?.foundValue ?? ''),
          }] : [],
          suggestedFollowUps: ['How was the variance calculated?', 'Can I still export to Excel?', 'Show affected row'],
        };
      }
    }

    // Default intelligent answer citing dataset summary
    return {
      answer: `According to the validated canonical dataset for **${canonicalDataset.title}**, the document contains ${canonicalDataset.totals.rowCount} items totaling ${canonicalDataset.totals.currencyDetected} values with validation status: **${canonicalDataset.validation.isValid ? 'VERIFIED' : 'ACTION REQUIRED'}**.`,
      citations: [
        {
          id: 'cite-table',
          label: canonicalDataset.title,
          pageNumber: 1,
          sourceText: `Canonical dataset verified at ${new Date(canonicalDataset.createdAt).toLocaleTimeString()}`,
        }
      ],
      suggestedFollowUps: ['What is the total revenue?', 'Show validation results', 'Download Excel spreadsheet'],
    };
  }

  public async summarizeDocument(
    canonicalDataset: CanonicalDataset,
    signal?: AbortSignal
  ): Promise<string> {
    await this.delay(400, signal);
    return `Executive Financial Summary: ${canonicalDataset.title} encompasses ${canonicalDataset.totals.rowCount} financial ledger entries in ${canonicalDataset.totals.currencyDetected}. All values have been normalized and reconciled with status ${canonicalDataset.validation.isValid ? 'PASSED' : 'FLAGGED'}.`;
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(new Error('Operation cancelled by user'));
      }
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Operation cancelled by user'));
      });
    });
  }
}
