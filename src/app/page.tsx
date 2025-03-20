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
} from '@/app/generator';

export default function Home() {
  const { theme, setTheme } = useContext(ThemeContext);
  const {
    rounding,
    borderColor,
    primaryColor,
    secondaryColor,
    mainHeaderSize,
  } = theme;

  // State declarations
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState<ExampleText | null>(null);
  const [images, setImages] = useState<ExampleImages | null>(null);
  const [headerHtml, setHeaderHtml] = useState<string | null>(null);
  const [mainContentHtml, setMainContentHtml] = useState<string | null>(null);
  const [footerHtml, setFooterHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<string | null>(null);

  // Retry function for a specific step
  const retryStep = async (step: string) => {
    setLoading(true);
    setError(null);
    try {
      switch (step) {
        case 'images':
          const imagesResult = await generateImages(prompt);
          setImages(imagesResult.exampleImages);
          break;
        case 'header':
          if (!content)
            throw new Error('Content not available for header generation');
          const headerResult = await generateHeader(
            prompt,
            theme,
            content.header
          );
          setHeaderHtml(headerResult.htmlStructure.header);
          break;
        case 'mainContent':
          if (!images)
            throw new Error('Images not available for main content generation');
          const mainContentResult = await generateMainContent(
            prompt,
            theme,
            images
          );
          setMainContentHtml(mainContentResult.htmlStructure.mainContent);
          break;
        case 'footer':
          const footerResult = await generateFooter(prompt, theme);
          setFooterHtml(footerResult.htmlStructure.footer);
          break;
        default:
          throw new Error('Invalid step for retry');
      }
      setFailedStep(null);
    } catch (err) {
      setError(`Failed to retry ${step}: ${(err as Error).message}`);
      setFailedStep(step);
    } finally {
      setLoading(false);
    }
  };

  // Generate function with sequential async calls
  const generate = async () => {
    if (!prompt.length) return;
    setLoading(true);
    setError(null);
    setFailedStep(null);

    try {
      // Step 1: Generate base theme
      const baseTheme: BaseTheme = await generateBaseTheme(prompt);
      setTheme(baseTheme);

      // Step 2: Generate content
      const contentResult: { exampleText: ExampleText } = await generateContent(
        prompt,
        baseTheme
      );
      setContent(contentResult.exampleText);

      // Step 3: Generate images
      try {
        const imagesResult: { exampleImages: ExampleImages } =
          await generateImages(prompt);
        setImages(imagesResult.exampleImages);
      } catch (err) {
        setFailedStep('images');
        throw new Error(`Failed at images step: ${(err as Error).message}`);
      }

      // Step 4: Generate header
      try {
        const headerResult: { htmlStructure: { header: string } } =
          await generateHeader(
            prompt,
            baseTheme,
            contentResult.exampleText.header
          );
        setHeaderHtml(headerResult.htmlStructure.header);
      } catch (err) {
        setFailedStep('header');
        throw new Error(`Failed at header step: ${(err as Error).message}`);
      }

      // Step 5: Generate main content
      try {
        const mainContentResult: { htmlStructure: { mainContent: string } } =
          await generateMainContent(prompt, baseTheme, images as ExampleImages);
        setMainContentHtml(mainContentResult.htmlStructure.mainContent);
      } catch (err) {
        setFailedStep('mainContent');
        throw new Error(
          `Failed at main content step: ${(err as Error).message}`
        );
      }

      // Step 6: Generate footer
      try {
        const footerResult: { htmlStructure: { footer: string } } =
          await generateFooter(prompt, baseTheme);
        setFooterHtml(footerResult.htmlStructure.footer);
      } catch (err) {
        setFailedStep('footer');
        throw new Error(`Failed at footer step: ${(err as Error).message}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ color: 'red' }}>{error}</p>
            {failedStep && (
              <button
                onClick={() => retryStep(failedStep)}
                style={{
                  marginTop: '5px',
                  backgroundColor: primaryColor,
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: rounding,
                }}
              >
                Retry {failedStep}
              </button>
            )}
          </div>
        )}
      </div>
      <div className='mt-32 pb-20 ml-[3rem]'>
        <div className='flex flex-col max-w-5xl'>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {headerHtml && (
                <div
                  className='flex mb-5'
                  dangerouslySetInnerHTML={{ __html: headerHtml }}
                />
              )}
              <div className='flex flex-row items-center mb-10'>
                {images?.smallHeaderCompanion && (
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
                )}
                {content?.header && (
                  <h1
                    style={{
                      fontSize: mainHeaderSize,
                      color: secondaryColor,
                      marginLeft: '30px',
                      maxWidth: '400px',
                    }}
                  >
                    {content.header}
                  </h1>
                )}
              </div>
              {mainContentHtml && (
                <div
                  className='flex mb-5'
                  dangerouslySetInnerHTML={{ __html: mainContentHtml }}
                />
              )}
              {footerHtml && (
                <div
                  className='flex mb-5'
                  dangerouslySetInnerHTML={{ __html: footerHtml }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
