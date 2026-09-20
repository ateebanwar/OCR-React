import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  Bot,
  User,
} from 'lucide-react';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';
import { Button } from '@/components/ui/Button';
import './DocumentChatPage.css';

export const DocumentChatPage: React.FC = () => {
  const {
    document,
    canonicalDataset,
    conversation,
    askChatQuestion,
  } = useDocumentSession();

  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isSubmitting) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setIsSubmitting(true);

    try {
      await askChatQuestion(query);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="chat-page-container">
      {/* Active Document Header Indicator (Section 49) */}
      <div className="chat-context-header">
        <div className="context-left">
          <div className="context-icon-circle">
            <FileText size={18} />
          </div>
          <div>
            <span className="context-badge">DOCUMENT CHAT CONTEXT</span>
            <h2 className="context-title">
              {document ? document.name : 'General Financial Assistant (No active document)'}
            </h2>
          </div>
        </div>

        {canonicalDataset && (
          <div className="context-meta-pills">
            <span className="pill-metric font-mono-num">{canonicalDataset.totals.rowCount} Canonical Rows</span>
            <span className={`pill-status ${canonicalDataset.validation.isValid ? 'valid' : 'warning'}`}>
              {canonicalDataset.validation.isValid ? '✓ Reconciled' : '⚠ Flagged'}
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-area" role="log" aria-label="Conversation with Financial AI">
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.role}`}>
            <div className={`message-avatar ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <Bot size={18} />
              ) : msg.role === 'user' ? (
                <User size={18} />
              ) : (
                <Sparkles size={16} />
              )}
            </div>

            <div className="message-bubble-wrapper">
              <div className="message-header-line">
                <span className="message-sender-name">
                  {msg.role === 'assistant'
                    ? 'LedgerAI Financial Intel'
                    : msg.role === 'user'
                    ? 'Analyst'
                    : 'System Pipeline'}
                </span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    title="Copy response"
                    aria-label="Copy response"
                  >
                    {copiedId === msg.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  </button>
                )}
              </div>

              <div className="message-body-text">{msg.content}</div>

              {/* Citations Badges linking to Canonical Dataset Cells */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="citations-tray">
                  <span className="citations-label">Verified Citations:</span>
                  {msg.citations.map((cite) => (
                    <span key={cite.id} className="citation-badge" title={cite.sourceText || cite.label}>
                      <FileText size={12} />
                      <span>{cite.label}</span>
                      {cite.cellDisplayValue && (
                        <span className="cite-value font-mono-num">{cite.cellDisplayValue}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="followups-tray">
                  {msg.suggestedFollowUps.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="followup-chip-btn"
                      onClick={() => {
                        setInputQuery(chip);
                        textareaRef.current?.focus();
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="chat-composer-container">
        <form className="chat-composer-box" onSubmit={handleSend}>
          <textarea
            ref={textareaRef}
            rows={1}
            className="composer-textarea"
            placeholder={
              document
                ? `Ask about figures, totals, rows, or reconciliation in "${document.name}" (Press Enter to send)...`
                : 'Ask a general financial intelligence question...'
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Chat query input"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputQuery.trim() || isSubmitting}
            isLoading={isSubmitting}
            rightIcon={<Send size={15} />}
          >
            Send
          </Button>
        </form>
        <span className="composer-hint">
          All document answers are cross-verified against the Canonical Dataset. Enter to submit, Shift+Enter for new line.
        </span>
      </div>
    </div>
  );
};
