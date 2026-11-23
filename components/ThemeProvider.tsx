'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/storage';
import { THEME_PRESETS, ThemePreset } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: string;
  themePreset: ThemePreset;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'unikl-navy',
  themePreset: THEME_PRESETS[0],
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>('unikl-navy');

  useEffect(() => {
    // Read theme from localStorage or default to unikl-navy
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const validTheme = THEME_PRESETS.find((p) => p.id === savedTheme);
    const themeToApply = validTheme ? validTheme.id : 'unikl-navy';

    setCurrentTheme(themeToApply);
    applyThemeClass(themeToApply);

    const handleStorage = () => {
      const updated = localStorage.getItem(STORAGE_KEYS.THEME);
      if (updated && updated !== currentTheme) {
        setCurrentTheme(updated);
        applyThemeClass(updated);
      }
    };

    window.addEventListener('dashboard_storage_update', handleStorage);
    return () => window.removeEventListener('dashboard_storage_update', handleStorage);
  }, []);

  const applyThemeClass = (themeId: string) => {
    // Remove all previous theme classes
    THEME_PRESETS.forEach((preset) => {
      document.documentElement.classList.remove(preset.cssClass);
    });
    const selected = THEME_PRESETS.find((p) => p.id === themeId) || THEME_PRESETS[0];
    document.documentElement.classList.add(selected.cssClass);
  };

  const setTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    applyThemeClass(themeId);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, themeId);
      window.dispatchEvent(new Event('dashboard_storage_update'));
    } catch (e) {
      console.error(e);
    }
  };

  const activePreset = THEME_PRESETS.find((p) => p.id === currentTheme) || THEME_PRESETS[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, themePreset: activePreset, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
