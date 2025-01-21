export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'id';
  currency: 'USD' | 'IDR';
  notifications: {
    enabled: boolean;
    sound: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  notifications: {
    enabled: true,
    sound: true,
  },
};

class SettingsService {
  private readonly SETTINGS_KEY = 'wallet-mate-settings';

  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (!stored) {
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(stored) as AppSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    const currentSettings = this.getSettings();
    const newSettings = {
      ...currentSettings,
      ...settings,
    };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
    return newSettings;
  }

  resetSettings(): AppSettings {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
}

export const settingsService = new SettingsService();
