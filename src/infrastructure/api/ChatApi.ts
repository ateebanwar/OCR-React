import { AIProvider, ChatAnswerResponse } from '../ai/AIProvider';
import { ApiClientFactory } from './ApiClientFactory';
import { ChatMessage } from '@/domain/conversation/Conversation';
import { CanonicalDataset } from '@/domain/dataset/CanonicalDataset';

export class ChatApi {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider ?? ApiClientFactory.getProvider();
  }

  public async askQuestion(
    question: string,
    canonicalDataset: CanonicalDataset | null,
    history: ChatMessage[],
    signal?: AbortSignal
  ): Promise<ChatAnswerResponse> {
    return this.provider.answerDocumentQuestion(question, canonicalDataset, history, signal);
  }
}
