'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import { ThemeContext } from './components/ThemeContext';
import {
  BaseTheme,
  ExampleImages,
  ExampleText,
  generateBaseTheme,
  generateContent,
  generateFooter,
  generateHeader,
  generateImages,
  generateMainContent,
  HtmlStructure,
} from '@/app/generator';

export default function Home() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { rounding, borderColor, primaryColor } = theme;
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState<ExampleText>({} as ExampleText);
  const [images, setImages] = useState<ExampleImages>({} as ExampleImages);
  const [header, setHeader] = useState<HtmlStructure['header']>(
    {} as HtmlStructure['header']
  );
  const [mainContent, setMainContent] = useState<HtmlStructure['mainContent']>(
    {} as HtmlStructure['mainContent']
  );
  const [footer, setFooter] = useState<HtmlStructure['footer']>(
    {} as HtmlStructure['footer']
  );
  const [loading, setLoading] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const handleGeneration = async ({
    sectId,
    gen,
  }: {
    sectId: number;
    gen: () => Promise<void>;
  }) => {
    setLoading(prevLoading => ({ ...prevLoading, [sectId]: true }));
    await gen();
    setLoading(prevLoading => ({ ...prevLoading, [sectId]: false }));
  };

  const generate = async () => {
    if (!prompt.length) return;

    await handleGeneration({
      sectId: 1,
      gen: async () => {
        const baseTheme: BaseTheme = await generateBaseTheme(prompt);
        setTheme(baseTheme);
      },
    });
    await handleGeneration({
      sectId: 2,
      gen: async () => {
        const content: { exampleText: ExampleText } = await generateContent(
          prompt,
          theme
        );
        setContent(content.exampleText);
      },
    });
    handleGeneration({
      sectId: 4,
      gen: async () => {
        const header: { htmlStructure: { header: string } } =
          await generateHeader(prompt, theme, content.header);
        setHeader(header.htmlStructure.header);
      },
    });
    await handleGeneration({
      sectId: 3,
      gen: async () => {
        const images: { exampleImages: ExampleImages } = await generateImages(
          prompt
        );
        setImages(images.exampleImages);
      },
    });
    handleGeneration({
      sectId: 5,
      gen: async () => {
        const mainContent: { htmlStructure: { mainContent: string } } =
          await generateMainContent(prompt, theme, images);
        setMainContent(mainContent.htmlStructure.mainContent);
      },
    });
    handleGeneration({
      sectId: 6,
      gen: async () => {
        const footer: { htmlStructure: { footer: string } } =
          await generateFooter(prompt, theme);
        setFooter(footer.htmlStructure.footer);
      },
    });
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
          disabled={Object.values(loading).some(isLoading => isLoading)}
          style={{
            marginTop: '20px',
            backgroundColor: Object.values(loading).some(isLoading => isLoading)
              ? 'grey'
              : primaryColor,
            borderColor,
            color: 'white',
            padding: '10px 20px',
            borderRadius: rounding,
            fontSize: '20px',
          }}
        >
          {Object.values(loading).some(isLoading => isLoading)
            ? 'Loading...'
            : 'Generate'}
        </button>
      </div>
      <div className='mt-32 pb-20 ml-[3rem]'>
        <div className='flex flex-col max-w-5xl'>
          {!loading[4].valueOf() ? (
            <div
              className='flex mb-5'
              dangerouslySetInnerHTML={{
                __html: header || '',
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
          <div className='flex flex-row items-center mb-10'>
            {!loading[3].valueOf() && images?.smallHeaderCompanion?.length > 0 ? (
              <Image
                src={images.smallHeaderCompanion}
                alt=''
                width={208}
                height={208}
                style={{
                  borderRadius: theme.rounding,
                  border: `solid 2px ${theme.borderColor}`,
                }}
              />
            ) : (
              <div>Loading...</div>
            )}
            {!loading[2].valueOf() ? (
              <h1
                style={{
                  fontSize: theme.mainHeaderSize,
                  color: theme.secondaryColor,
                  marginLeft: '30px',
                  maxWidth: '400px',
                }}
              >
                {content.header}
              </h1>
            ) : (
              <div>Loading...</div>
            )}
          </div>
          {!loading[5].valueOf() ? (
            <div
              className='flex mb-5'
              dangerouslySetInnerHTML={{
                __html: mainContent || '',
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
          {!loading[6].valueOf() ? (
            <div
              className='flex mb-5'
              dangerouslySetInnerHTML={{
                __html: footer || '',
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}
