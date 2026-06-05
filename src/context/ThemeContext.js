import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import webStorage from '../utils/webStorage';

const THEME_STORAGE_KEY = '@patungan_theme_v2';

const THEMES = {
  default: {
    name: 'Bawaan',
    description: 'Tema standar bawaan aplikasi',
    colors: {
      bgPrimary: '#FFFFFF',
      bgSecondary: '#F5F5F7',
      bgCard: '#FFFFFF',
      textPrimary: '#1A1A1A',
      textSecondary: '#6C6C6C',
      textTertiary: '#AEAEB2',
      blue: '#007AFF',
      green: '#34C759',
      orange: '#FF9500',
      red: '#FF3B30',
      whatsapp: '#25D366',
      status: {
        Lunas: { bg: '#D4EDDA', text: '#155724', dot: '#28A745' },
        Nyicil: { bg: '#FFF3CD', text: '#856404', dot: '#FFC107' },
        Belum: { bg: '#F0F0F0', text: '#6C6C6C', dot: '#AEAEB2' },
      },
      border: '#E5E5EA',
      borderStrong: '#C7C7CC',
      progressColor: (persen) => {
        if (persen >= 1) return '#34C759';
        if (persen >= 0.5) return '#FF9500';
        return '#FF3B30';
      },
      progressTrack: '#EEEEEE',
      statusBarStyle: 'dark',
    },
  },
  sakura: {
    name: 'Sakura',
    description: 'Nuansa pink lembut dan estetik',
    colors: {
      bgPrimary: '#FFF5F7',
      bgSecondary: '#FDE8ED',
      bgCard: '#FFFFFF',
      textPrimary: '#4A2C3A',
      textSecondary: '#8B6B7A',
      textTertiary: '#C4A3B2',
      blue: '#E86B8C',
      green: '#7BC4A8',
      orange: '#F4A460',
      red: '#E85D75',
      whatsapp: '#25D366',
      status: {
        Lunas: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
        Nyicil: { bg: '#FFF8E1', text: '#F57F17', dot: '#FFC107' },
        Belum: { bg: '#FCE4EC', text: '#AD1457', dot: '#E86B8C' },
      },
      border: '#F0D6E0',
      borderStrong: '#E0BCC8',
      progressColor: (persen) => {
        if (persen >= 1) return '#7BC4A8';
        if (persen >= 0.5) return '#F4A460';
        return '#E85D75';
      },
      progressTrack: '#F5E4EA',
      statusBarStyle: 'dark',
    },
  },
  samudra: {
    name: 'Samudra',
    description: 'Nuansa biru segar dan menenangkan',
    colors: {
      bgPrimary: '#F0F8FF',
      bgSecondary: '#E3F0F8',
      bgCard: '#FFFFFF',
      textPrimary: '#1A3A4A',
      textSecondary: '#5A7A8A',
      textTertiary: '#9AB0C0',
      blue: '#4A90D9',
      green: '#4CB8A8',
      orange: '#E8A040',
      red: '#E06060',
      whatsapp: '#25D366',
      status: {
        Lunas: { bg: '#E0F5EC', text: '#1B6B50', dot: '#26A69A' },
        Nyicil: { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800' },
        Belum: { bg: '#E3F0F8', text: '#4A6A8A', dot: '#7A9ABA' },
      },
      border: '#D0E0EA',
      borderStrong: '#B0C8D8',
      progressColor: (persen) => {
        if (persen >= 1) return '#26A69A';
        if (persen >= 0.5) return '#FF9800';
        return '#E06060';
      },
      progressTrack: '#E3ECF3',
      statusBarStyle: 'dark',
    },
  },
  gelap: {
    name: 'Gelap',
    description: 'Tema gelap nyaman di mata',
    colors: {
      bgPrimary: '#1C1C1E',
      bgSecondary: '#2C2C2E',
      bgCard: '#2C2C2E',
      textPrimary: '#F5F5F7',
      textSecondary: '#AEAEB2',
      textTertiary: '#636366',
      blue: '#0A84FF',
      green: '#30D158',
      orange: '#FF9F0A',
      red: '#FF453A',
      whatsapp: '#25D366',
      status: {
        Lunas: { bg: '#1A3A2A', text: '#30D158', dot: '#30D158' },
        Nyicil: { bg: '#3A2A1A', text: '#FF9F0A', dot: '#FF9F0A' },
        Belum: { bg: '#2C2C2E', text: '#8E8E93', dot: '#636366' },
      },
      border: '#38383A',
      borderStrong: '#48484A',
      progressColor: (persen) => {
        if (persen >= 1) return '#30D158';
        if (persen >= 0.5) return '#FF9F0A';
        return '#FF453A';
      },
      progressTrack: '#2C2C2E',
      statusBarStyle: 'light',
    },
  },
};

const ThemeContext = createContext({
  themeName: 'default',
  theme: THEMES.default,
  colors: THEMES.default.colors,
  setThemeName: () => {},
  allThemes: THEMES,
});

export function ThemeProvider({ children }) {
  const [themeName, setThemeNameState] = useState('default');

  useEffect(() => {
    (async () => {
      try {
        const saved = await webStorage.getItem(THEME_STORAGE_KEY);
        if (saved && THEMES[saved]) {
          setThemeNameState(saved);
        }
      } catch {}
    })();
  }, []);

  const setThemeName = useCallback(async (name) => {
    if (THEMES[name]) {
      setThemeNameState(name);
      try {
        await webStorage.setItem(THEME_STORAGE_KEY, name);
      } catch {}
    }
  }, []);

  const value = useMemo(() => ({
    themeName,
    theme: THEMES[themeName] || THEMES.default,
    colors: THEMES[themeName]?.colors || THEMES.default.colors,
    setThemeName,
    allThemes: THEMES,
  }), [themeName, setThemeName]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
