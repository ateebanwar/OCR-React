export type AppTheme = 'light' | 'dark';
export type ModelRoutingMode = 'balanced' | 'fast' | 'deep-financial-audit';

export interface ApplicationSettings {
  theme: AppTheme;
  modelRoutingMode: ModelRoutingMode;
  autoValidateExcel: boolean;
  preserveSourceFormatting: boolean;
  defaultCurrency: string;
  enableSoundEffects: boolean;
}

export const defaultSettings: ApplicationSettings = {
  theme: 'light',
  modelRoutingMode: 'balanced',
  autoValidateExcel: true,
  preserveSourceFormatting: true,
  defaultCurrency: 'USD',
  enableSoundEffects: false,
};
