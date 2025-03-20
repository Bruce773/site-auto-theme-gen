// Home.tsx
'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import { ThemeContext } from './components/ThemeContext';
import {
  generateBaseTheme,
  generateContent,
  generateImages,
  generateHeader,
  generateMainContent,
  generateFooter,
} from '@/app/generator';
import { BaseTheme, ExampleText, ExampleImages } from './types';

type GeneratedData = {
  theme: BaseTheme | null;
  content: ExampleText | null;
  images: ExampleImages | null;
  headerHtml: string | null;
  mainContentHtml: string | null;
  footerHtml: string | null;
};

export default function Home() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [prompt, setPrompt] = useState('');
  const [data, setData] = useState<GeneratedData>({
    theme: null,
    content: null,
    images: null,
    headerHtml: null,
    mainContentHtml: null,
    footerHtml: null,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt) return;
    setStatus('loading');
    setErrorMessage(null);
    setData({
      theme: null,
      content: null,
      images: null,
      headerHtml: null,
      mainContentHtml: null,
      footerHtml: null,
    });

    try {
      const theme = await generateBaseTheme(prompt);
      setTheme(theme);
      setData(d => ({ ...d, theme }));

      const contentResult = await generateContent(prompt, theme);
      const content = contentResult.exampleText;
      setData(d => ({ ...d, content }));

      const [imagesResult, headerResult] = await Promise.all([
        generateImages(prompt),
        generateHeader(prompt, theme, content.header),
      ]);
      setData(d => ({
        ...d,
        images: imagesResult.exampleImages,
        headerHtml: headerResult.htmlStructure.header,
      }));

      const imagesForMainContent = imagesResult.exampleImages || {
        pageBackground:
          'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
        smallHeaderCompanion:
          'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      };

      const [mainContentResult, footerResult] = await Promise.all([
        generateMainContent(prompt, theme, imagesForMainContent),
        generateFooter(prompt, theme),
      ]);
      setData(d => ({
        ...d,
        mainContentHtml: mainContentResult.htmlStructure.mainContent,
        footerHtml: footerResult.htmlStructure.footer,
      }));

      setStatus('idle');
    } catch (error) {
      console.error('Generation error:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
      setStatus('error');
    }
  };

  return (
    <div className='mt-[40vh] ml-32'>
      <div className='flex flex-col items-start'>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.metaKey && e.key === 'Enter' && generate()}
          placeholder='A construction site with orange as the primary color...'
          rows={4}
          style={{
            border: `solid 3px ${theme.borderColor}`,
            borderRadius: theme.rounding,
            color: theme.primaryColor,
            fontSize: '22px',
            padding: '25px',
            width: '700px',
          }}
        />
        <button
          onClick={generate}
          disabled={status === 'loading'}
          style={{
            marginTop: '20px',
            backgroundColor: status === 'loading' ? 'grey' : theme.primaryColor,
            borderColor: theme.borderColor,
            color: 'white',
            padding: '10px 20px',
            borderRadius: theme.rounding,
            fontSize: '20px',
          }}
        >
          {status === 'loading' ? 'Loading...' : 'Generate'}
        </button>
      </div>
      {status === 'error' && (
        <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
      )}

      <div className='mt-32 pb-20 max-w-5xl'>
        {status === 'loading' && <div>Loading...</div>}
        {data.headerHtml && (
          <div dangerouslySetInnerHTML={{ __html: data.headerHtml }} />
        )}
        <div className='flex flex-row items-center mb-10'>
          {data.images?.smallHeaderCompanion && (
            <Image
              src={data.images.smallHeaderCompanion}
              alt=''
              width={208}
              height={208}
              style={{
                borderRadius: theme.rounding,
                border: `solid 2px ${theme.borderColor}`,
              }}
            />
          )}
          {data.content?.header && (
            <h1
              style={{
                fontSize: theme.mainHeaderSize,
                color: theme.secondaryColor,
                marginLeft: '30px',
                maxWidth: '400px',
              }}
            >
              {data.content.header}
            </h1>
          )}
        </div>
        {data.mainContentHtml && (
          <div dangerouslySetInnerHTML={{ __html: data.mainContentHtml }} />
        )}
        {data.footerHtml && (
          <div dangerouslySetInnerHTML={{ __html: data.footerHtml }} />
        )}
      </div>
    </div>
  );
}
