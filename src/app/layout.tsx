'use client';

import './globals.css';
import { ThemeContext, ThemeProvider } from './components/ThemeContext';
import { useContext } from 'react';
import { ThemeDrawer } from './components/ThemeDrawer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <ThemeProvider>
        <Body>{children}</Body>
      </ThemeProvider>
    </html>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  const {
    theme: { backgroundColor },
  } = useContext(ThemeContext);

  return (
    <body
      style={{ background: backgroundColor }}
      className='flex flex-row justify-center h-[100vh]'
    >
      <ThemeDrawer />
      <div className='h-full w-full overflow-scroll shadow-xl'>{children}</div>
    </body>
  );
}
