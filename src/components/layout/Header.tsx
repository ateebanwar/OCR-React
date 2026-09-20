import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  FileSpreadsheet,
  MessageSquare,
  FileText,
  UserCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';
import { Button } from '@/components/ui/Button';
import './Header.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { document, canonicalDataset, settings, updateSettings, profile, clearSession } = useDocumentSession();

  const isWorkspace = location.pathname.startsWith('/workspace');
  const isChat = location.pathname.startsWith('/chat');

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="app-header" role="banner">
      {/* Left: Document Context Indicator (Section 49) */}
      <div className="header-context-area">
        {document ? (
          <div className="doc-context-chip" title={document.name}>
            <div className="chip-icon-box">
              <FileText size={15} />
            </div>
            <div className="chip-details">
              <span className="chip-label">Active Document</span>
              <span className="chip-filename">{document.name}</span>
            </div>
            {canonicalDataset && (
              <span className={`chip-status-badge ${canonicalDataset.validation.isValid ? 'valid' : 'warning'}`}>
                {canonicalDataset.validation.isValid ? '✓ Reconciled' : '⚠ Audit Flags'}
              </span>
            )}
            <button
              type="button"
              className="chip-reset-btn"
              onClick={clearSession}
              title="Close active document"
              aria-label="Close active document"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        ) : (
          <div className="doc-context-empty">
            <Sparkles size={16} className="sparkle-icon" />
            <span>Ready for Document Intelligence</span>
          </div>
        )}
      </div>

      {/* Center: Dual Mode Switcher (Convert vs Chat) */}
      <div className="header-mode-switcher" role="tablist" aria-label="Workspace Modes">
        <button
          type="button"
          role="tab"
          aria-selected={isWorkspace}
          className={`mode-tab-btn ${isWorkspace ? 'active' : ''}`}
          onClick={() => navigate('/workspace')}
        >
          <FileSpreadsheet size={16} />
          <span>Convert & Overview</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={isChat}
          className={`mode-tab-btn ${isChat ? 'active' : ''}`}
          onClick={() => navigate('/chat')}
        >
          <MessageSquare size={16} />
          <span>Financial Chat</span>
        </button>
      </div>

      {/* Right: Theme Toggle + Profile Pill */}
      <div className="header-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          className="theme-toggle-btn"
        >
          {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </Button>

        <div className="header-profile-pill" onClick={() => navigate('/settings')} role="button" tabIndex={0}>
          <div className="profile-avatar-circle">
            <UserCheck size={14} />
          </div>
          <span className="profile-name-text">{profile.fullName || 'Analyst'}</span>
        </div>
      </div>
    </header>
  );
};
