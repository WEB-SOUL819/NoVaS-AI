
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'stealth';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  enableStealthMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark'
  );

  // Apply theme to document when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('theme-dark', 'theme-light', 'theme-stealth');
    
    // Add the current theme class
    root.classList.add(`theme-${theme}`);
    
    // Apply specific body classes for each theme
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode', 'stealth-mode');
    } else if (theme === 'stealth') {
      document.body.classList.add('stealth-mode');
      document.body.classList.remove('dark-mode', 'light-mode');
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode', 'stealth-mode');
    }
    
    // Store theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const enableStealthMode = () => {
    setThemeState('stealth');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, enableStealthMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
