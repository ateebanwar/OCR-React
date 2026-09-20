import { UserProfile, defaultUserProfile } from '@/domain/profile/UserProfile';
import { ApplicationSettings, defaultSettings } from '@/domain/settings/ApplicationSettings';

const STORAGE_KEYS = {
  USER_PROFILE: 'ledgerai_user_profile_v1',
  APP_SETTINGS: 'ledgerai_app_settings_v1',
  ACTIVE_DOCUMENT_ID: 'ledgerai_active_doc_id_v1',
} as const;

export class LocalStorageAdapter {
  public static getProfile(): UserProfile {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!item) return defaultUserProfile;
      return { ...defaultUserProfile, ...JSON.parse(item) };
    } catch {
      return defaultUserProfile;
    }
  }

  public static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify({
          ...profile,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }

  public static getSettings(): ApplicationSettings {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (!item) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(item) };
    } catch {
      return defaultSettings;
    }
  }

  public static saveSettings(settings: ApplicationSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }

  public static getActiveDocumentId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOCUMENT_ID);
    } catch {
      return null;
    }
  }

  public static setActiveDocumentId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_DOCUMENT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_DOCUMENT_ID);
      }
    } catch (e) {
      console.error('Failed to persist active document id', e);
    }
  }
}
