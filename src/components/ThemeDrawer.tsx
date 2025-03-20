import { useContext } from 'react';
import { ThemeContext } from '@/components/ThemeContext';
import { BaseTheme } from '@/types';

export const ThemeDrawer = () => {
  const { theme } = useContext(ThemeContext);

  const themePropsList = Object.keys(theme);

  const getThemePropVal = (themeProp: keyof BaseTheme) =>
    theme[themeProp] as string;

  return (
    <div className='h-full flex-col bg-white p-10 flex'>
      <h2 className='mb-6 text-black text-xl font-bold'>Theme Styles</h2>
      {themePropsList
        .filter(item => item !== 'exampleContent')
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
                    ? getThemePropVal(themeProp as keyof BaseTheme)
                    : 'black',
                backgroundColor:
                  themeProp === 'backgroundColor'
                    ? getThemePropVal(themeProp as keyof BaseTheme)
                    : '',
                border:
                  themeProp === 'borderColor'
                    ? `solid 2px ${getThemePropVal(
                        themeProp as keyof BaseTheme
                      )}`
                    : '',
              }}
            >
              {getThemePropVal(themeProp as keyof BaseTheme)}
            </div>
          </div>
        ))}
    </div>
  );
};
