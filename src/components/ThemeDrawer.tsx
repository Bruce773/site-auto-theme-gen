// ThemeDrawer.tsx
import { useContext, useState } from 'react';
import { ThemeContext } from '@/components/ThemeContext';
import { BaseTheme } from '@/types';
import { generateBaseTheme } from '@/generator';
import { HiSparkles } from 'react-icons/hi2';

export const ThemeDrawer = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showInput, setShowInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const themePropsList = Object.keys(theme) as (keyof BaseTheme)[];

  const getThemePropVal = (themeProp: keyof BaseTheme) =>
    theme[themeProp] as string;

  const handleMagic = () => {
    if (!showInput) {
      setShowInput(true);
    } else {
      generate();
    }
  };

  const generate = async () => {
    if (!prompt) return;
    setStatus('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Include current theme in the prompt
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
        setShowInput(false);
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

  return (
    <div className='h-full flex-col bg-white p-10 flex'>
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
      {showInput ? (
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
              fontSize: '16px',
              padding: '18px',
              width: '200px',
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
          {showInput && (
            <button
              onClick={() => {
                setShowInput(false);
                setPrompt('');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              style={{
                marginTop: '20px',
                backgroundColor:
                  status === 'loading' ? 'grey' : theme.primaryColor,
                borderColor: theme.borderColor,
                color: 'white',
                padding: '5px 10px',
                borderRadius: theme.rounding,
                fontSize: '18px',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      ) : null}
      <div
        onClick={handleMagic}
        className='shadow-md rounded-full p-4 mt-3 flex flex-row items-center justify-center text-blue-500 w-fit hover:shadow-xl transition-shadow duration-200 cursor-pointer font-bold'
        aria-label={
          showInput ? 'Regenerate theme' : 'Open theme regeneration input'
        }
      >
        {showInput ? (
          <div className='flex items-center gap-2'>
            <HiSparkles />
            Regenerate
          </div>
        ) : (
          <HiSparkles />
        )}
      </div>
    </div>
  );
};
