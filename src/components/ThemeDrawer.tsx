// ThemeDrawer.tsx
import { useContext, useState } from 'react';
import { ThemeContext } from '@/components/ThemeContext';
import { BaseTheme } from '@/types';
import { generateBaseTheme } from '@/generator';
import { HiSparkles } from 'react-icons/hi2';
import { FaRegCopy } from 'react-icons/fa6';

export const ThemeDrawer = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [activePanel, setActivePanel] = useState<
    'none' | 'regenerate' | 'json'
  >('none');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const themePropsList = Object.keys(theme) as (keyof BaseTheme)[];

  const getThemePropVal = (themeProp: keyof BaseTheme) =>
    theme[themeProp] as string;

  const generate = async () => {
    if (!prompt) return;
    setStatus('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const currentThemeDetails = Object.entries(theme)
        .filter(([key]) => key !== 'exampleContent')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      const enhancedPrompt = `${prompt}\n\nCurrent theme: ${currentThemeDetails}`;
      const newTheme = await generateBaseTheme(enhancedPrompt, theme);

      setTheme(newTheme);
      setSuccessMessage('Theme updated successfully!');
      setStatus('idle');
      setTimeout(() => {
        setSuccessMessage(null);
        setActivePanel('none');
        setPrompt('');
      }, 1500);
    } catch (error) {
      console.error('Theme generation error:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred while generating the theme');
      }
      setStatus('error');
    }
  };

  const copyThemeJson = () => {
    const themeJson = JSON.stringify(theme, null, 2);
    navigator.clipboard
      .writeText(themeJson)
      .then(() => {
        alert('Theme JSON copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div
      className={`h-full flex-col bg-white p-10 flex transition-all duration-300 ${
        activePanel === 'none' ? 'w-1/4' : 'w-1/3'
      }`}
    >
      <h2 className='mb-6 text-black text-xl font-bold'>Theme Styles</h2>
      {themePropsList
        .filter(item => item !== ('exampleContent' as keyof BaseTheme))
        .map((themeProp, idx) => (
          <div className='text-black flex' key={idx}>
            {themeProp}:
            <div
              style={{
                marginLeft: '10px',
                marginBottom: '5px',
                padding: '0px 5px',
                color:
                  themeProp === 'primaryColor' || themeProp === 'secondaryColor'
                    ? getThemePropVal(themeProp)
                    : 'black',
                backgroundColor:
                  themeProp === 'backgroundColor'
                    ? getThemePropVal(themeProp)
                    : '',
                border:
                  themeProp === 'borderColor'
                    ? `solid 2px ${getThemePropVal(themeProp)}`
                    : '',
              }}
            >
              {getThemePropVal(themeProp)}
            </div>
          </div>
        ))}
      <div className='mb-10' />

      {/* Initial Buttons */}
      {activePanel === 'none' && (
        <div className='flex flex-row items-center mt-3 gap-6'>
          <div
            onClick={() => setActivePanel('regenerate')}
            className='shadow-md rounded-full p-4 flex flex-row items-center justify-center text-blue-500 w-fit hover:shadow-xl transition-all duration-200 cursor-pointer font-bold border-solid border-2 border-blue-500 hover:bg-gray-50'
            aria-label='Open theme regeneration input'
          >
            <HiSparkles />
          </div>
          <div
            onClick={() => setActivePanel('json')}
            className='flex flex-row items-center justify-center text-gray-800 w-fit hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer text-lg p-4 rounded-full'
            aria-label='Show theme JSON'
          >
            <FaRegCopy />
          </div>
        </div>
      )}

      {/* Regenerate Panel */}
      {activePanel === 'regenerate' && (
        <div className='flex flex-col items-start mt-3'>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.metaKey && e.key === 'Enter' && generate()}
            placeholder='A construction site with orange as the primary color...'
            rows={4}
            className='rounded-md border-2 border-blue-500'
            style={{
              color: theme.primaryColor,
              fontSize: '16px',
              padding: '18px',
              width: '250px',
              height: '300px',
            }}
          />
          {status === 'error' && (
            <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
          )}
          {status === 'idle' && successMessage && (
            <p style={{ color: 'green', marginTop: '10px' }}>
              {successMessage}
            </p>
          )}
          {status === 'loading' && (
            <div className='flex items-center justify-center mt-4'>
              <svg
                className='animate-spin h-5 w-5 text-gray-500'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8H4z'
                />
              </svg>
              <span className='ml-2 text-gray-500'>Generating...</span>
            </div>
          )}
          <div className='flex flex-row items-center mt-2 gap-2'>
            <button
              onClick={generate}
              className='shadow-md rounded-full p-4 flex flex-row items-center justify-center text-blue-500 w-fit hover:shadow-xl transition-all duration-200 cursor-pointer font-bold border-solid border-2 border-blue-500 hover:bg-gray-50 gap-2'
              aria-label='Regenerate theme'
            >
              <HiSparkles /> Regenerate
            </button>
            <button
              onClick={() => {
                setActivePanel('none');
                setPrompt('');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className='py-2 px-3 text-blue-500 font-[18px] hover:bg-gray-50 rounded-md transition-all duration-200'
              aria-label='Cancel theme regeneration'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* JSON Panel */}
      {activePanel === 'json' && (
        <div className='mt-3'>
          <pre
            style={{
              backgroundColor: '#000000',
              padding: '10px',
              borderRadius: '5px',
              overflowX: 'auto',
              color: 'white',
            }}
          >
            {JSON.stringify(theme, null, 2)}
          </pre>
          <div className='flex flex-row items-center mt-2 gap-2'>
            <button
              onClick={copyThemeJson}
              className='shadow-md rounded-md py-2 px-4 flex flex-row items-center justify-center text-black w-fit hover:shadow-xl transition-all duration-200 cursor-pointer font-bold border-solid border-2 border-gray-700 hover:bg-gray-50 gap-2'
              aria-label='Copy theme JSON to clipboard'
            >
              <FaRegCopy /> Copy
            </button>
            <button
              onClick={() => setActivePanel('none')}
              className='py-2 px-3 text-gray-700 font-[18px] hover:bg-gray-50 rounded-md transition-all duration-200'
              aria-label='Close JSON view'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
