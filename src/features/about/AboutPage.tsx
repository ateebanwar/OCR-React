import React from 'react';
import { ShieldCheck, Database, Layers, Lock, Cpu } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import './AboutPage.css';

export const AboutPage: React.FC = () => {
  return (
    <div className="about-page-container">
      <div className="about-header">
        <div className="about-logo-badge">
          <ShieldCheck size={32} />
        </div>
        <h1 className="about-title">About LedgerAI Platform</h1>
        <p className="about-subtitle">
          Enterprise Financial Intelligence, Canonical Dataset Ingestion, and Deterministic Excel Engine
        </p>
      </div>

      <div className="about-sections-grid">
        {/* Core Principles */}
        <Card className="about-card">
          <div className="about-card-top">
            <Database size={22} className="about-card-icon" />
            <h2 className="about-card-title">The Canonical Dataset Architecture</h2>
          </div>
          <p className="about-card-text">
            AI language models generate untrusted probabilistic text. In LedgerAI, raw model output is
            never directly consumed by the user interface or spreadsheet exporters. Instead, every figure
            passes through strict schema validation, fixed-point decimal normalization, arithmetic subtotal
            cross-checks, and balance equation reconciliation before being admitted into the <strong>Canonical Dataset</strong>.
          </p>
          <div className="about-badges-list">
            <span className="about-pill">Single Source of Truth</span>
            <span className="about-pill">Zero Direct AI Data</span>
            <span className="about-pill">Audit Trail Preserved</span>
          </div>
        </Card>

        <Card className="about-card">
          <div className="about-card-top">
            <Lock size={22} className="about-card-icon" />
            <h2 className="about-card-title">Financial Precision & Privacy Guarantee</h2>
          </div>
          <p className="about-card-text">
            Monetary calculations strictly avoid IEEE-754 floating point approximations (eliminating errors like
            <code>0.1 + 0.2 = 0.30000000000000004</code>). Null, missing, and zero values are semantically preserved
            rather than coerced. All profile details remain local to this browser, and no private API credentials
            are ever embedded in client code.
          </p>
          <div className="about-badges-list">
            <span className="about-pill">Decimal-Safe Fixed Point</span>
            <span className="about-pill">Zero Cloud Credential Leaks</span>
            <span className="about-pill">Browser LocalStorage Only</span>
          </div>
        </Card>

        {/* Technical Architecture Details */}
        <Card className="about-card">
          <div className="about-card-top">
            <Cpu size={22} className="about-card-icon" />
            <h2 className="about-card-title">Technology Stack & Standards</h2>
          </div>
          <div className="tech-stack-details">
            <div className="tech-item">
              <span className="tech-label">Frontend Framework:</span>
              <span className="tech-value">React 18 / 19 + TypeScript (Strict)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Build Tool:</span>
              <span className="tech-value">Vite 6 (ESM, Code Splitting)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Excel Engine:</span>
              <span className="tech-value">ExcelJS (Authentic binary .xlsx with verification checksums)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Styling:</span>
              <span className="tech-value">Modern CSS Tokens (Light/Dark themes, Fluid clamp scaling)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Verification Browser:</span>
              <span className="tech-value">Microsoft Edge (Primary target)</span>
            </div>
          </div>
        </Card>

        <Card className="about-card">
          <div className="about-card-top">
            <Layers size={22} className="about-card-icon" />
            <h2 className="about-card-title">System Specifications & Release</h2>
          </div>
          <div className="tech-stack-details">
            <div className="tech-item">
              <span className="tech-label">Application Version:</span>
              <span className="tech-value">2.4.0-production-release</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Model Router:</span>
              <span className="tech-value">Multi-Signal Complexity Router (Fast & Pro Tiers)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Accessibility:</span>
              <span className="tech-value">WCAG 2.1 AA (Keyboard focus, High Contrast, Screen Readers)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Supported Viewports:</span>
              <span className="tech-value">360px Smartphone to 60-inch 4K Monitors</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
