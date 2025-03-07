'use client';

/* eslint-disable @next/next/no-img-element */
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../ThemeContext';
import Image from 'next/image';

export const WebPreview = () => {
  const { theme } = useContext(ThemeContext);
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    console.log('theme', theme);
    setCurrentTheme(theme);
  }, [theme]);

  return (
    <div className='flex flex-col max-w-5xl'>
      <div className='flex flex-row items-center mb-10'>
        <Image
          src={currentTheme.exampleContent.exampleImages.smallHeaderCompanion}
          alt=''
          width={208}
          height={208}
          style={{
            borderRadius: currentTheme.rounding,
            border: `solid 2px ${currentTheme.borderColor}`,
            height: '208px',
            width: '208px',
          }}
        />
        <h1
          style={{
            fontSize: currentTheme.mainHeaderSize,
            color: currentTheme.secondaryColor,
            marginLeft: '30px',
            maxWidth: '400px',
          }}
        >
          {currentTheme.exampleContent.exampleText.header}
        </h1>
      </div>
      <img
        src={currentTheme.exampleContent.exampleImages.pageBackground}
        alt='Simple Tree'
        style={{
          borderRadius: currentTheme.rounding,
          // border: `solid 2px ${theme.borderColor}`,
          // marginLeft: '30px',
          width: '100%',
          height: '50%',
        }}
      />
    </div>
  );
};
