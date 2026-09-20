export interface MessageCitation {
  id: string;
  label: string;
  rowId?: string;
  columnKey?: string;
  pageNumber?: number;
  cellDisplayValue?: string;
  sourceText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: MessageCitation[];
  isDocumentContext: boolean;
  status: 'sent' | 'received' | 'error';
  suggestedFollowUps?: string[];
}

export interface DocumentConversation {
  id: string;
  documentId?: string;
  messages: ChatMessage[];
  lastUpdated: string;
}
