import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Scale,
  Sparkles,
  Send,
} from 'lucide-react';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProcessingTimeline } from '@/components/ui/ProcessingTimeline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    document,
    canonicalDataset,
    processingState,
    processFile,
    cancelProcessing,
    askChatQuestion,
  } = useDocumentSession();

  const [promptQuery, setPromptQuery] = useState('');

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptQuery.trim()) return;
    askChatQuestion(promptQuery.trim());
    navigate('/chat');
  };

  const handleFileSelect = async (file: File | { name: string; size: number }) => {
    await processFile(file);
    navigate('/workspace');
  };

  return (
    <div className="dashboard-container">
      {/* Processing Banner if currently running */}
      {processingState.isProcessing && (
        <ProcessingTimeline
          currentStageIndex={processingState.stageIndex}
          stageName={processingState.stageName}
          stageDetail={processingState.stageDetail}
          percent={processingState.percent}
          status={processingState.status}
          onCancel={cancelProcessing}
        />
      )}

      {/* Hero Header */}
      <section className="dashboard-hero">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-sparkle-icon" />
          <span>PRECISION FINANCIAL DOCUMENT INTELLIGENCE</span>
        </div>
        <h1 className="hero-heading">
          Ingest any financial document. <br />
          <span className="hero-gradient-text">Verify, reconcile, and export to Excel.</span>
        </h1>
        <p className="hero-subheading">
          AI extraction is untrusted by design. Every figure is normalized through decimal-safe arithmetic,
          arithmetically validated against stated totals, and consolidated into an immutable Canonical Dataset.
        </p>

        {/* Ask Me Anything Query Bar */}
        <form className="dashboard-query-bar" onSubmit={handleAskSubmit}>
          <input
            type="text"
            className="query-input"
            placeholder={
              document
                ? `Ask anything about active document "${document.name}" (e.g., What is total revenue?)...`
                : 'Ask a financial question, or describe a document you wish to analyze...'
            }
            value={promptQuery}
            onChange={(e) => setPromptQuery(e.target.value)}
            aria-label="Ask a financial question"
          />
          <Button type="submit" variant="primary" size="md" rightIcon={<Send size={16} />}>
            Ask AI
          </Button>
        </form>
      </section>

      {/* Active Document Card (if one is loaded) */}
      {document && canonicalDataset && (
        <Card elevated className="active-session-banner">
          <div className="active-banner-content">
            <div className="active-banner-icon">
              <FileSpreadsheet size={28} />
            </div>
            <div className="active-banner-info">
              <span className="active-banner-tag">ACTIVE DOCUMENT IN MEMORY</span>
              <h2 className="active-banner-title">{document.name}</h2>
              <div className="active-banner-meta">
                <span>{document.metadata.pageCount} Pages</span>
                <span>•</span>
                <span>{canonicalDataset.totals.rowCount} Canonical Rows</span>
                <span>•</span>
                <span>Currency: {canonicalDataset.totals.currencyDetected}</span>
                <span>•</span>
                <span className={`status-pill ${canonicalDataset.validation.isValid ? 'valid' : 'warning'}`}>
                  {canonicalDataset.validation.isValid ? '✓ 0 Errors' : '⚠ Audit Flags'}
                </span>
              </div>
            </div>
            <div className="active-banner-actions">
              <Button
                variant="primary"
                onClick={() => navigate('/workspace')}
                rightIcon={<ArrowRight size={16} />}
              >
                Inspect & Convert
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/chat')}
                leftIcon={<MessageSquare size={16} />}
              >
                Open Chat
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* File Ingestion Dropzone */}
      <section className="dashboard-upload-section">
        <div className="section-title-row">
          <h2 className="section-title">Upload Document or Select Benchmark</h2>
          <span className="section-badge">PDF • XLSX • CSV</span>
        </div>
        <FileUploader onFileSelect={handleFileSelect} isLoading={processingState.isProcessing} />
      </section>

      {/* Architecture Highlights Grid */}
      <section className="dashboard-pillars-grid">
        <Card className="pillar-card">
          <div className="pillar-icon-box success">
            <ShieldCheck size={22} />
          </div>
          <h3 className="pillar-title">Canonical Single Source of Truth</h3>
          <p className="pillar-desc">
            Raw AI extraction is untrusted. Everything shown in Overview, Chat, and Excel strictly derives from
            the same deterministic Canonical Dataset.
          </p>
        </Card>

        <Card className="pillar-card">
          <div className="pillar-icon-box primary">
            <Scale size={22} />
          </div>
          <h3 className="pillar-title">Decimal-Safe Financial Arithmetic</h3>
          <p className="pillar-desc">
            Never converts missing values to zero. Eliminates IEEE-754 floating-point drift and enforces mathematical
            subtotal reconciliation.
          </p>
        </Card>

        <Card className="pillar-card">
          <div className="pillar-icon-box excel">
            <TrendingUp size={22} />
          </div>
          <h3 className="pillar-title">Verified Authentic .XLSX</h3>
          <p className="pillar-desc">
            Produces genuine binary Excel workbooks with frozen header rows, typed numeric formatting, and automatic
            post-generation validation checks.
          </p>
        </Card>
      </section>
    </div>
  );
};
