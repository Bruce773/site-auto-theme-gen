'use client';

import { useContext, useState } from 'react';
import { ThemeContext } from './components/ThemeContext';
import { generateTheme } from './generator';

export default function Home() {
  const {
    theme: { rounding, borderColor, primaryColor },
    setTheme,
  } = useContext(ThemeContext);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.length) return;

    setLoading(true);
    const data = await generateTheme({ themeDesc: prompt });
    setLoading(false);
    setTheme(data);
    console.log(data);
  };

  return (
    <div className='h-full flex items-center justify-center'>
      <div className='flex flex-col items-start'>
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
            borderColor,
            border: 'solid 3px',
            borderRadius: rounding,
            color: 'black',
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
    </div>
  );
}
