import { describe, it, expect } from 'vitest';
import { ModelRouter } from '@/infrastructure/ai/ModelRouter';

describe('Multi-Signal AI Model Routing Engine', () => {
  it('routes clean single-table digital PDF to Gemini 2.5 Flash', () => {
    const report = {
      isScanned: false,
      pageCount: 2,
      detectedCurrencies: ['USD'],
      estimatedTableCount: 1,
      ocrQuality: 'crisp-digital' as const,
      recommendedModel: 'Gemini 2.5 Flash',
      complexityScore: 3,
    };

    const decision = ModelRouter.route(report, 'balanced');
    expect(decision.selectedModel).toBe('Gemini 2.5 Flash');
    expect(decision.tier).toBe('fast');
  });

  it('routes noisy scanned multi-currency report to Gemini 1.5 Pro Specialist', () => {
    const report = {
      isScanned: true,
      pageCount: 8,
      detectedCurrencies: ['USD', 'EUR'],
      estimatedTableCount: 4,
      ocrQuality: 'scanned-noisy' as const,
      recommendedModel: 'Gemini 1.5 Pro',
      complexityScore: 7,
    };

    const decision = ModelRouter.route(report, 'balanced');
    expect(decision.selectedModel).toContain('Gemini 1.5 Pro');
    expect(decision.tier).toBe('pro-specialist');
  });

  it('respects user preference overrides', () => {
    const report = {
      isScanned: false,
      pageCount: 1,
      detectedCurrencies: ['USD'],
      estimatedTableCount: 1,
      ocrQuality: 'crisp-digital' as const,
      recommendedModel: 'Gemini 2.5 Flash',
      complexityScore: 1,
    };

    const decision = ModelRouter.route(report, 'deep-financial-audit');
    expect(decision.tier).toBe('pro-specialist');
  });
});
