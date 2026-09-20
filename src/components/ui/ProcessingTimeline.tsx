import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, StopCircle } from 'lucide-react';
import { Button } from './Button';
import { DocumentStatus } from '@/domain/document/Document';
import './ProcessingTimeline.css';

const STAGES = [
  'File received & validated',
  'Document layout analyzed',
  'AI model routed & initialized',
  'Tabular content extracted',
  'Decimal values normalized',
  'Deterministic validation executed',
  'Subtotals & equations reconciled',
  'Canonical dataset prepared',
  'Excel workbook generated',
  'Spreadsheet checksum verified',
];

export interface ProcessingTimelineProps {
  currentStageIndex: number;
  stageName: string;
  stageDetail: string;
  percent: number;
  status: DocumentStatus;
  onCancel?: () => void;
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  currentStageIndex,
  stageName,
  stageDetail,
  percent,
  status,
  onCancel,
}) => {
  return (
    <div className="processing-timeline-wrapper">
      <div className="timeline-header">
        <div className="timeline-title-row">
          <div className="timeline-status-indicator">
            {status === 'ready' ? (
              <CheckCircle2 className="icon-success animate-pulse" size={24} />
            ) : status === 'failed' ? (
              <XCircle className="icon-error" size={24} />
            ) : status === 'cancelled' ? (
              <AlertTriangle className="icon-warning" size={24} />
            ) : (
              <div className="timeline-spinner" />
            )}
          </div>
          <div>
            <h3 className="timeline-heading">{stageName}</h3>
            <p className="timeline-subheading">{stageDetail}</p>
          </div>
        </div>

        {status !== 'ready' && status !== 'failed' && status !== 'cancelled' && onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<StopCircle size={15} />}>
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Track */}
      <div className="timeline-progress-bar-container">
        <div
          className={`timeline-progress-fill ${status === 'ready' ? 'done' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 10 Semantic Stage Nodes */}
      <div className="timeline-stages-grid">
        {STAGES.map((title, idx) => {
          const stageNum = idx + 1;
          const isCompleted = currentStageIndex > stageNum || status === 'ready';
          const isCurrent = currentStageIndex === stageNum && status !== 'ready' && status !== 'failed';
          const isFailed = currentStageIndex === stageNum && status === 'failed';

          return (
            <div
              key={stageNum}
              className={`timeline-stage-item ${
                isCompleted ? 'completed' : isCurrent ? 'current' : isFailed ? 'failed' : 'pending'
              }`}
            >
              <div className="stage-marker">
                {isCompleted ? (
                  <CheckCircle2 size={14} />
                ) : isCurrent ? (
                  <span className="current-dot" />
                ) : (
                  <span className="stage-num">{stageNum}</span>
                )}
              </div>
              <span className="stage-label">{title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
