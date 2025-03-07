'use client';

import { useContext, useState } from 'react';
import { ThemeContext } from './components/ThemeContext';
import { generateTheme } from './generator';
import { WebPreview } from './components/WebPreview/WebPreview';

export default function Home() {
  const {
    theme: { rounding, borderColor, primaryColor },
    setTheme,
  } = useContext(ThemeContext);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generate = async () => {
    if (!prompt.length) return;

    setLoading(true);
    const data = await generateTheme({ themeDesc: prompt });
    setLoading(false);
    setTheme(data);
    setShowPreview(true);
  };

  return (
    <div className='mt-[40vh]'>
      <div className='flex flex-col items-start ml-32'>
        <textarea
          onKeyDown={e => {
            if (e.metaKey && e.key === 'Enter') {
              generate();
            }
          }}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='A construction site that uses orange as their primary color...'
          style={{
            border: `solid 3px ${borderColor}`,
            borderRadius: rounding,
            color: primaryColor,
            fontSize: '22px',
            padding: '25px',
          }}
          rows={4}
          cols={50}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{
            marginTop: '20px',
            backgroundColor: loading ? 'grey' : primaryColor,
            borderColor,
            color: 'white',
            padding: '10px 20px',
            borderRadius: rounding,
            fontSize: '20px',
          }}
        >
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </div>
      {showPreview && (
        <div className='mt-32 pb-20 ml-[3rem]'>
          <WebPreview />
        </div>
      )}
    </div>
  );
}
