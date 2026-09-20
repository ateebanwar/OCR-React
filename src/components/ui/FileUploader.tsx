import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '@/infrastructure/ai/fixtures/sampleDocuments';
import './FileUploader.css';

export interface FileUploaderProps {
  onFileSelect: (file: File | { name: string; size: number }) => void;
  isLoading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndUpload = (file: File) => {
    setValidationError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const valid = ['pdf', 'xlsx', 'xls', 'csv'];

    if (!ext || !valid.includes(ext)) {
      setValidationError(`Unsupported file type ".${ext}". Please upload a PDF, XLSX, or CSV financial document.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setValidationError('File size exceeds the 25 MB limit.');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) validateAndUpload(file);
    }
  };

  return (
    <div className="file-uploader-container">
      <div
        className={`dropzone ${isDragOver ? 'dragover' : ''} ${isLoading ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload document area. Drag and drop PDF or click to browse"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.xlsx,.xls,.csv"
          className="hidden-file-input"
          disabled={isLoading}
        />

        <div className="dropzone-icon-circle">
          <UploadCloud size={32} className="dropzone-icon" />
        </div>

        <h3 className="dropzone-title">Upload Financial Document</h3>
        <p className="dropzone-subtitle">
          Drag & drop your PDF, Excel (.xlsx), or CSV here, or <span className="highlight-browse">browse files</span>
        </p>

        <div className="dropzone-badges">
          <span className="format-tag">PDF (Digital & Scanned)</span>
          <span className="format-tag">XLSX</span>
          <span className="format-tag">CSV</span>
          <span className="format-tag">Up to 25 MB</span>
        </div>

        {validationError && (
          <div className="upload-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Quick Load Financial Benchmark Fixtures */}
      <div className="sample-documents-section">
        <div className="sample-header">
          <Sparkles size={16} className="sample-sparkle" />
          <span className="sample-title">Or test instantly with pre-loaded audit fixtures:</span>
        </div>

        <div className="sample-buttons-grid">
          {SAMPLE_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              className="sample-card-btn"
              disabled={isLoading}
              onClick={() => onFileSelect({ name: doc.name, size: doc.sizeBytes })}
            >
              <div className="sample-card-top">
                <FileText size={16} className="sample-doc-icon" />
                <span className="sample-category">{doc.category}</span>
                <span className="sample-currency">{doc.currency}</span>
              </div>
              <p className="sample-name">{doc.name}</p>
              <span className="sample-desc">{doc.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
