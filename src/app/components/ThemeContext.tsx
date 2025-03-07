'use client';

import React, { createContext, useState, ReactNode } from 'react';

export interface Theme {
  rounding: string;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  backgroundColor: string;
  mainHeaderSize: string;
  exampleContent: {
    exampleText: { header: string };
    exampleImages: { pageBackground: string; smallHeaderCompanion: string };
  };
}

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultTheme: Theme = {
  rounding: '4px',
  primaryColor: '#007bff',
  secondaryColor: '#5bc0de',
  borderColor: '#007bff',
  backgroundColor: '#ade5ff3f',
  mainHeaderSize: '22px',
  exampleContent: {
    exampleText: { header: '' },
    exampleImages: { pageBackground: '', smallHeaderCompanion: '' },
  },
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: defaultTheme,
  setTheme: () => {},
});

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
