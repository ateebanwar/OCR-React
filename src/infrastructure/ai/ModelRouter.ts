import { DocumentAnalysisReport } from './AIProvider';

export interface ModelRoutingDecision {
  selectedModel: string;
  reason: string;
  tier: 'fast' | 'pro-specialist';
  expectedLatencyMs: number;
  fallbackModel?: string;
  signalsEvaluated: {
    pageCount: number;
    isScanned: boolean;
    ocrQuality: string;
    currenciesCount: number;
    estimatedTables: number;
    complexityScore: number;
  };
}

export class ModelRouter {
  public static route(report: DocumentAnalysisReport, userPreference: 'balanced' | 'fast' | 'deep-financial-audit' = 'balanced'): ModelRoutingDecision {
    const { pageCount, isScanned, ocrQuality, detectedCurrencies, estimatedTableCount, complexityScore } = report;

    // Direct override based on explicit user setting
    if (userPreference === 'fast') {
      return {
        selectedModel: 'Gemini 2.5 Flash',
        reason: 'User preference forced Fast mode for rapid turnaround.',
        tier: 'fast',
        expectedLatencyMs: 1200,
        fallbackModel: 'Gemini 1.5 Pro',
        signalsEvaluated: {
          pageCount,
          isScanned,
          ocrQuality,
          currenciesCount: detectedCurrencies.length,
          estimatedTables: estimatedTableCount,
          complexityScore,
        },
      };
    }

    if (userPreference === 'deep-financial-audit') {
      return {
        selectedModel: 'Gemini 1.5 Pro (Deep Audit)',
        reason: 'User preference selected maximum financial precision and cross-table reconciliation.',
        tier: 'pro-specialist',
        expectedLatencyMs: 3500,
        fallbackModel: 'Gemini 2.5 Flash',
        signalsEvaluated: {
          pageCount,
          isScanned,
          ocrQuality,
          currenciesCount: detectedCurrencies.length,
          estimatedTables: estimatedTableCount,
          complexityScore,
        },
      };
    }

    // Balanced multi-signal intelligence:
    // Signal weights:
    // - Complex scanned noise: +3
    // - High table count (> 2): +2
    // - Multi-currency (> 1): +2
    // - High page count (> 4): +2
    let calculatedComplexity = complexityScore;

    if (isScanned && (ocrQuality === 'scanned-noisy' || ocrQuality === 'handwritten-elements')) {
      calculatedComplexity += 3;
    }
    if (estimatedTableCount >= 2) {
      calculatedComplexity += 2;
    }
    if (detectedCurrencies.length > 1) {
      calculatedComplexity += 2;
    }
    if (pageCount > 4) {
      calculatedComplexity += 2;
    }

    if (calculatedComplexity >= 6) {
      return {
        selectedModel: 'Gemini 1.5 Pro (Financial Specialist)',
        reason: `High document complexity (${calculatedComplexity}/10) with ${estimatedTableCount} tables, ${pageCount} pages, and ${ocrQuality} OCR requiring deep table reasoning.`,
        tier: 'pro-specialist',
        expectedLatencyMs: 3200,
        fallbackModel: 'Gemini 2.5 Flash',
        signalsEvaluated: {
          pageCount,
          isScanned,
          ocrQuality,
          currenciesCount: detectedCurrencies.length,
          estimatedTables: estimatedTableCount,
          complexityScore: calculatedComplexity,
        },
      };
    }

    return {
      selectedModel: 'Gemini 2.5 Flash',
      reason: `Standard document complexity (${calculatedComplexity}/10) with crisp digital layout suited for rapid streaming extraction.`,
      tier: 'fast',
      expectedLatencyMs: 1400,
      fallbackModel: 'Gemini 1.5 Pro',
      signalsEvaluated: {
        pageCount,
        isScanned,
        ocrQuality,
        currenciesCount: detectedCurrencies.length,
        estimatedTables: estimatedTableCount,
        complexityScore: calculatedComplexity,
      },
    };
  }
}
