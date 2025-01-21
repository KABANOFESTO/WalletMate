'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings } from '@/services/settings';
import { settingsService } from '@/services/settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());

  useEffect(() => {
    // Load settings on mount
    setSettings(settingsService.getSettings());
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = settingsService.updateSettings(newSettings);
    setSettings(updated);
  };

  const resetSettings = () => {
    const defaults = settingsService.resetSettings();
    setSettings(defaults);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
