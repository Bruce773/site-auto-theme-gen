import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import Image from 'next/image';

export const WebPreview = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className='flex'>
      <Image
        src='/simple-tree.jpg'
        alt='Simple Tree'
        width={208}
        height={208}
        style={{
          borderRadius: theme.rounding,
          border: `solid 2px ${theme.borderColor}`,
        }}
      />
      <h1
        style={{
          fontSize: theme.mainHeaderSize,
          color: theme.secondaryColor,
          marginLeft: '30px',
          maxWidth: '400px',
        }}
      >
        {theme.exampleText.header}
      </h1>
    </div>
  );
};
