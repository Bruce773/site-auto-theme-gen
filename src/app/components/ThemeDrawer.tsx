import { useContext } from 'react';
import { Theme, ThemeContext } from './ThemeContext';

export const ThemeDrawer = () => {
  const { theme } = useContext(ThemeContext);

  const themePropsList = Object.keys(theme);

  const getThemePropVal = (themeProp: keyof Theme) =>
    theme[themeProp] as string;

  return (
    <div className='h-[100vh] fixed top-0 left-0 bg-white p-10 shadow-lg'>
      {themePropsList
        .filter(item => item !== 'exampleText')
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
                    ? getThemePropVal(themeProp as keyof Theme)
                    : 'black',
                backgroundColor:
                  themeProp === 'backgroundColor'
                    ? getThemePropVal(themeProp as keyof Theme)
                    : '',
                border:
                  themeProp === 'borderColor'
                    ? `solid 2px ${getThemePropVal(themeProp as keyof Theme)}`
                    : '',
              }}
            >
              {getThemePropVal(themeProp as keyof Theme)}
            </div>
          </div>
        ))}
    </div>
  );
};
