import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Document, DocumentStatus } from '@/domain/document/Document';
import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';
import { GeneratedSpreadsheet } from '@/domain/spreadsheet/GeneratedSpreadsheet';
import { DocumentConversation, ChatMessage } from '@/domain/conversation/Conversation';
import { ApplicationSettings } from '@/domain/settings/ApplicationSettings';
import { UserProfile } from '@/domain/profile/UserProfile';
import { LocalStorageAdapter } from '@/infrastructure/storage/LocalStorageAdapter';
import { ProcessDocumentUseCase, ProcessingProgressEvent } from '../use-cases/ProcessDocumentUseCase';
import { SpreadsheetApi } from '@/infrastructure/api/SpreadsheetApi';
import { ChatApi } from '@/infrastructure/api/ChatApi';
import { SAMPLE_DOCUMENTS } from '@/infrastructure/ai/fixtures/sampleDocuments';
import { ApplicationError } from '@/core/errors/ApplicationError';

export type WorkspaceMode = 'convert' | 'chat';

export interface DocumentSessionContextValue {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  document: Document | null;
  canonicalDataset: CanonicalDataset | null;
  generatedSpreadsheet: GeneratedSpreadsheet | null;
  conversation: DocumentConversation;
  processingState: {
    isProcessing: boolean;
    stageIndex: number;
    stageName: string;
    stageDetail: string;
    percent: number;
    status: DocumentStatus;
  };
  error: ApplicationError | null;
  profile: UserProfile;
  settings: ApplicationSettings;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<ApplicationSettings>) => void;
  processFile: (file: File | { name: string; size: number }) => Promise<void>;
  cancelProcessing: () => void;
  askChatQuestion: (question: string) => Promise<void>;
  downloadSpreadsheet: () => void;
  clearSession: () => void;
  loadSampleDocument: (sampleId: string) => Promise<void>;
}

const DocumentSessionContext = createContext<DocumentSessionContextValue | null>(null);

const spreadsheetApi = new SpreadsheetApi();
const chatApi = new ChatApi();

export const DocumentSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() => LocalStorageAdapter.getProfile());
  const [settings, setSettingsState] = useState<ApplicationSettings>(() => LocalStorageAdapter.getSettings());
  const [mode, setMode] = useState<WorkspaceMode>('convert');

  const [document, setDocument] = useState<Document | null>(null);
  const [canonicalDataset, setCanonicalDataset] = useState<CanonicalDataset | null>(null);
  const [generatedSpreadsheet, setGeneratedSpreadsheet] = useState<GeneratedSpreadsheet | null>(null);

  const [conversation, setConversation] = useState<DocumentConversation>({
    id: 'conv-default',
    messages: [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: 'Hello! I am your Financial Document Intelligence Assistant. You can upload a financial statement, invoice, or audit report to convert it into a verified canonical Excel workbook and ask detailed financial questions.',
        timestamp: new Date().toISOString(),
        isDocumentContext: false,
        status: 'received',
        suggestedFollowUps: [
          'What is the difference between raw AI and Canonical Datasets?',
          'How do you prevent floating point calculation errors?',
          'Load TechCorp Q4 Statement sample',
        ],
      },
    ],
    lastUpdated: new Date().toISOString(),
  });

  const [processingState, setProcessingState] = useState<{
    isProcessing: boolean;
    stageIndex: number;
    stageName: string;
    stageDetail: string;
    percent: number;
    status: DocumentStatus;
  }>({
    isProcessing: false,
    stageIndex: 0,
    stageName: 'Idle',
    stageDetail: 'Waiting for document upload',
    percent: 0,
    status: 'idle',
  });

  const [error, setError] = useState<ApplicationError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme changes to root element
  useEffect(() => {
    window.document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      LocalStorageAdapter.saveProfile(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<ApplicationSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      LocalStorageAdapter.saveSettings(next);
      return next;
    });
  }, []);

  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProcessingState({
      isProcessing: false,
      stageIndex: 0,
      stageName: 'Cancelled',
      stageDetail: 'Processing was cancelled by the user',
      percent: 0,
      status: 'cancelled',
    });
  }, []);

  const processFile = useCallback(async (file: File | { name: string; size: number }) => {
    setError(null);
    abortControllerRef.current = new AbortController();

    setProcessingState({
      isProcessing: true,
      stageIndex: 1,
      stageName: 'Starting Pipeline',
      stageDetail: 'Initializing deterministic extraction pipeline',
      percent: 5,
      status: 'uploading',
    });

    try {
      const useCase = new ProcessDocumentUseCase();
      const result = await useCase.execute({
        file,
        settings,
        signal: abortControllerRef.current.signal,
        onProgress: (event: ProcessingProgressEvent) => {
          setProcessingState({
            isProcessing: event.percent < 100,
            stageIndex: event.stageIndex,
            stageName: event.stageName,
            stageDetail: event.detail,
            percent: event.percent,
            status: event.status,
          });
        },
      });

      setDocument(result.document);
      setCanonicalDataset(result.canonicalDataset);
      setGeneratedSpreadsheet(result.generatedSpreadsheet);

      // Add document ready notification to conversation context
      const docMsg: ChatMessage = {
        id: `msg-doc-${Date.now()}`,
        role: 'system',
        content: `**${result.document.name}** has been processed into a validated Canonical Dataset (${result.canonicalDataset.totals.rowCount} rows, ${result.canonicalDataset.totals.columnCount} columns). Validation status: **${result.canonicalDataset.validation.isValid ? 'PASSED (0 Errors)' : 'AUDIT FLAGGED'}**.`,
        timestamp: new Date().toISOString(),
        isDocumentContext: true,
        status: 'received',
        suggestedFollowUps: [
          'What is the total revenue/amount?',
          'Show line item breakdown',
          'Are there any validation warnings?',
          'Generate and download verified Excel',
        ],
      };

      setConversation((prev) => ({
        ...prev,
        documentId: result.document.id,
        messages: [...prev.messages, docMsg],
        lastUpdated: new Date().toISOString(),
      }));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const appErr =
        err instanceof ApplicationError
          ? err
          : new ApplicationError({
              code: 'PROCESSING_ERROR',
              message: err instanceof Error ? err.message : 'Unknown processing error',
              userMessage: 'An error occurred during document extraction or validation.',
            });
      setError(appErr);
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        status: 'failed',
        stageName: 'Processing Failed',
        stageDetail: appErr.userMessage,
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, [settings]);

  const askChatQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      isDocumentContext: !!canonicalDataset,
      status: 'sent',
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      lastUpdated: new Date().toISOString(),
    }));

    try {
      const response = await chatApi.askQuestion(question, canonicalDataset, conversation.messages);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
        citations: response.citations,
        isDocumentContext: !!canonicalDataset,
        status: 'received',
        suggestedFollowUps: response.suggestedFollowUps,
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
        lastUpdated: new Date().toISOString(),
      }));
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: 'I encountered an error answering your question. Please try again.',
        timestamp: new Date().toISOString(),
        isDocumentContext: !!canonicalDataset,
        status: 'error',
      };
      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [canonicalDataset, conversation.messages]);

  const downloadSpreadsheet = useCallback(() => {
    if (generatedSpreadsheet) {
      spreadsheetApi.downloadSpreadsheet(generatedSpreadsheet);
    }
  }, [generatedSpreadsheet]);

  const clearSession = useCallback(() => {
    cancelProcessing();
    setDocument(null);
    setCanonicalDataset(null);
    setGeneratedSpreadsheet(null);
    setError(null);
    setProcessingState({
      isProcessing: false,
      stageIndex: 0,
      stageName: 'Idle',
      stageDetail: 'Waiting for document upload',
      percent: 0,
      status: 'idle',
    });
  }, [cancelProcessing]);

  const loadSampleDocument = useCallback(async (sampleId: string) => {
    const fixture = SAMPLE_DOCUMENTS.find((d) => d.id === sampleId) || SAMPLE_DOCUMENTS[0]!;
    await processFile({
      name: fixture.name,
      size: fixture.sizeBytes,
    });
  }, [processFile]);

  return (
    <DocumentSessionContext.Provider
      value={{
        mode,
        setMode,
        document,
        canonicalDataset,
        generatedSpreadsheet,
        conversation,
        processingState,
        error,
        profile,
        settings,
        updateProfile,
        updateSettings,
        processFile,
        cancelProcessing,
        askChatQuestion,
        downloadSpreadsheet,
        clearSession,
        loadSampleDocument,
      }}
    >
      {children}
    </DocumentSessionContext.Provider>
  );
};

export const useDocumentSession = (): DocumentSessionContextValue => {
  const context = useContext(DocumentSessionContext);
  if (!context) {
    throw new Error('useDocumentSession must be used within a DocumentSessionProvider');
  }
  return context;
};
