'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { BaseTheme } from '@/app/generator';

interface ThemeContextProps {
  theme: BaseTheme;
  setTheme: (theme: BaseTheme) => void;
}

const defaultTheme: BaseTheme = {
  rounding: 'small',
  primaryColor: '#007bff',
  secondaryColor: '#5bc0de',
  borderColor: '#007bff',
  backgroundColor: '#ade5ff3f',
  mainHeaderSize: '22px',
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: defaultTheme,
  setTheme: () => {},
});

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<BaseTheme>(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
