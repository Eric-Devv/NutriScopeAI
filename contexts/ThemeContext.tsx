import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define the theme colors
export const lightTheme = {
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  secondary: '#FF9800',
  secondaryLight: '#FFB74D',
  secondaryDark: '#F57C00',
  accent: '#2196F3',
  accentLight: '#64B5F6',
  accentDark: '#1976D2',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#212121',
  textSecondary: '#757575',
  divider: '#EEEEEE',
  cardBg: '#FFFFFF',
  statusBarStyle: 'dark',
};

export const darkTheme = {
  primary: '#81C784',
  primaryLight: '#A5D6A7',
  primaryDark: '#4CAF50',
  secondary: '#FFB74D',
  secondaryLight: '#FFCC80',
  secondaryDark: '#FF9800',
  accent: '#64B5F6',
  accentLight: '#90CAF9',
  accentDark: '#2196F3',
  success: '#66BB6A',
  warning: '#FFD54F',
  error: '#E57373',
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  divider: '#2D2D2D',
  cardBg: '#1E1E1E',
  statusBarStyle: 'light',
};

type Theme = typeof lightTheme;
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeMode: 'system',
  setThemeMode: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  // Determine if we're in dark mode
  const isDark = themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark');
  
  // Get the active theme
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};