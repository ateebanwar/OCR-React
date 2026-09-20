import { AIProvider } from '../ai/AIProvider';
import { MockAIProvider } from '../ai/MockAIProvider';
import { BackendApiClient } from './BackendApiClient';
import { appConfig, ApiMode } from '@/core/configuration/appConfig';

export class ApiClientFactory {
  private static instance: AIProvider | null = null;

  public static getProvider(modeOverride?: ApiMode): AIProvider {
    const mode = modeOverride || appConfig.apiMode;
    if (!ApiClientFactory.instance) {
      if (mode === 'backend') {
        ApiClientFactory.instance = new BackendApiClient();
      } else {
        ApiClientFactory.instance = new MockAIProvider();
      }
    }
    return ApiClientFactory.instance;
  }

  public static resetInstance(): void {
    ApiClientFactory.instance = null;
  }
}
