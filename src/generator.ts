// generator.ts
import { callApiAndParse } from '@/utils';
import { BaseTheme, ExampleText, ExampleImages } from '@/types';

const getThemePrompt = (
  themeDesc: string,
  previousTheme?: BaseTheme
): string => `
  You are an experienced website designer with expertise in color palettes and modern styling.
  Based on this description: "${themeDesc}", return a JSON object with:
  {
    "rounding": "string", // "none", "sm", "md", "lg", "full"
    "primaryColor": "string", // High contrast with background
    "secondaryColor": "string", // Contrasts with background
    "borderColor": "string", // Matches theme
    "backgroundColor": "string", // Primary background
    "mainHeaderSize": "string" // 28px-40px
  }
  ${
    previousTheme
      ? `Consider the previous theme settings when making adjustments:
    ${JSON.stringify(previousTheme, null, 2)}
    
    Evolve this theme based on the new description rather than creating something completely different.`
      : 'Ensure cohesive and visually appealing choices.'
  }
  The return value should only be the JSON object listed above with only the items included above.
`;

const getContentPrompt = (themeDesc: string, theme: BaseTheme): string => `
  Based on "${themeDesc}" and theme ${JSON.stringify(
  theme
)}, return a JSON object with:
  {
    "exampleText": {
      "header": "string" // 4-6 words
    }
  }
  Header must be 4-6 words and match the theme.
`;

// const getImagesPrompt = (themeDesc: string): string => `
//   For "${themeDesc}", generate 3-5 keywords from the description.
//   Using these keywords with the Pexels API, return a JSON object with:
//   {
//     "exampleImages": {
//       "pageBackground": "string", // Landscape image URL
//       "smallHeaderCompanion": "string" // Square image URL
//     }
//   }
//   Use src.original from Pexels. Ensure images match the description's tone.
// `;

const getHeaderPrompt = (
  themeDesc: string,
  theme: BaseTheme,
  headerText: string
): string => `
  For "${themeDesc}" with theme ${JSON.stringify(
  theme
)} and header "${headerText}", return a JSON object in the following format:
  {
    "htmlStructure": {
      "header": "string" // HTML with h1 logo and nav bar styled with theme styles in Tailwind CSS
    }
  }
  Ensure the response is valid JSON. Escape any special characters (e.g., quotes, newlines) in the HTML string to prevent JSON parsing errors.
  Style the HTML with theme colors, modern padding, and rounding.
`;

const getMainContentPrompt = (
  themeDesc: string,
  theme: BaseTheme,
  images: ExampleImages
): string => `
  For "${themeDesc}" with theme ${JSON.stringify(
  theme
)} and images ${JSON.stringify(
  images
)}, return a JSON object in the following format:
  {
    "htmlStructure": {
      "mainContent": "string" // HTML with hero image and text styled with theme styles in Tailwind CSS
    }
  }
  Ensure the response is valid JSON. Escape any special characters (e.g., quotes, newlines) in the HTML string to prevent JSON parsing errors.
  Style the HTML with theme colors, modern spacing, and include the provided images.
`;

const getFooterPrompt = (themeDesc: string, theme: BaseTheme): string => `
  For "${themeDesc}" with theme ${JSON.stringify(
  theme
)}, return a JSON object in the following format:
  {
    "htmlStructure": {
      "footer": "string" // HTML with contact and social links styled with theme styles in Tailwind CSS
    }
  }
  Ensure the response is valid JSON. Escape any special characters (e.g., quotes, newlines) in the HTML string to prevent JSON parsing errors.
  Style the HTML with theme colors and modern design.
`;

export const generateBaseTheme = (
  themeDesc: string,
  previousTheme?: BaseTheme
): Promise<BaseTheme> =>
  callApiAndParse<BaseTheme>(getThemePrompt(themeDesc, previousTheme), 500, {
    rounding: 'small',
    primaryColor: '#007BFF',
    secondaryColor: '#FFC107',
    borderColor: '#343A40',
    backgroundColor: '#F8F9FA',
    mainHeaderSize: '36px',
  });

export const generateContent = (
  themeDesc: string,
  theme: BaseTheme
): Promise<{ exampleText: ExampleText }> =>
  callApiAndParse<{ exampleText: ExampleText }>(
    getContentPrompt(themeDesc, theme),
    300,
    { exampleText: { header: 'Default Header' } }
  );

const PEXELS_API_KEY =
  process.env.NEXT_PUBLIC_PEXELS_API_KEY || 'your-pexels-api-key';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

const fetchPexelsImages = async (
  query: string,
  perPage: number = 2
): Promise<unknown[]> => {
  try {
    const response = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(
        query
      )}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error('Error fetching Pexels images:', error);
    return [];
  }
};

const getImagesPrompt = (themeDesc: string): string => `
  For "${themeDesc}", generate 3-5 keywords that describe the theme's tone and content.
  Return a JSON object with:
  {
    "keywords": ["string", "string", ...]
  }
  Ensure the keywords are relevant and suitable for querying an image API.
`;

export const generateImages = async (
  themeDesc: string
): Promise<{ exampleImages: ExampleImages }> => {
  const fallbackImages = {
    exampleImages: {
      pageBackground:
        'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      smallHeaderCompanion:
        'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
    },
  };

  try {
    const keywordResult = await callApiAndParse<{ keywords: string[] }>(
      getImagesPrompt(themeDesc),
      200,
      { keywords: [themeDesc.split(' ')[0]] }
    );

    const query = keywordResult.keywords.join(' ');
    if (!query) {
      return fallbackImages;
    }

    const photos = await fetchPexelsImages(query, 5);

    if (!photos || photos.length < 2) {
      return fallbackImages;
    }

    let pageBackground = '';
    let smallHeaderCompanion = '';

    for (const photo of photos as Array<{
      width: number;
      height: number;
      src: { original: string };
    }>) {
      const width = photo.width;
      const height = photo.height;
      const isLandscape = width > height;
      const isSquare = Math.abs(width - height) < 100;

      if (!pageBackground && isLandscape) {
        pageBackground = photo.src.original;
      }
      if (!smallHeaderCompanion && isSquare) {
        smallHeaderCompanion = photo.src.original;
      }

      if (pageBackground && smallHeaderCompanion) break;
    }

    if (!pageBackground) {
      pageBackground = (photos[0] as { src: { original: string } }).src
        .original;
    }
    if (!smallHeaderCompanion) {
      smallHeaderCompanion = (photos[1] as { src: { original: string } }).src
        .original;
    }

    return {
      exampleImages: {
        pageBackground,
        smallHeaderCompanion,
      },
    };
  } catch (error) {
    console.error('Error generating images:', error);
    return fallbackImages;
  }
};

export const generateHeader = (
  themeDesc: string,
  theme: BaseTheme,
  headerText: string
): Promise<{ htmlStructure: { header: string } }> =>
  callApiAndParse<{ htmlStructure: { header: string } }>(
    getHeaderPrompt(themeDesc, theme, headerText),
    400,
    {
      htmlStructure: {
        header: `<header style="background-color: ${theme.primaryColor}; padding: 1rem; border-radius: ${theme.rounding}; color: white;">
                  <h1>${headerText}</h1>
                  <nav><ul style="list-style: none; display: flex; gap: 1rem;">
                    <li><a href="#" style="color: white;">Home</a></li>
                    <li><a href="#" style="color: white;">About</a></li>
                    <li><a href="#" style="color: white;">Services</a></li>
                    <li><a href="#" style="color: white;">Contact</a></li>
                  </ul></nav>
                </header>`,
      },
    }
  );

export const generateMainContent = (
  themeDesc: string,
  theme: BaseTheme,
  images?: ExampleImages
): Promise<{ htmlStructure: { mainContent: string } }> => {
  const fallbackImages = {
    pageBackground:
      'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
    smallHeaderCompanion:
      'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
  };
  const imagesToUse = images || fallbackImages;

  return callApiAndParse<{ htmlStructure: { mainContent: string } }>(
    getMainContentPrompt(themeDesc, theme, imagesToUse),
    500,
    {
      htmlStructure: {
        mainContent: `<section style="background-color: ${theme.backgroundColor}; padding: 2rem; border-radius: ${theme.rounding};">
                          <div style="background-image: url(${imagesToUse.pageBackground}); background-size: cover; height: 300px; border-radius: ${theme.rounding};">
                            <h2 style="color: ${theme.primaryColor}; padding: 1rem; text-align: center;">Welcome</h2>
                          </div>
                          <p style="color: ${theme.secondaryColor}; margin-top: 1rem; text-align: center;">Discover more.</p>
                        </section>`,
      },
    }
  );
};

export const generateFooter = (
  themeDesc: string,
  theme: BaseTheme
): Promise<{ htmlStructure: { footer: string } }> =>
  callApiAndParse<{ htmlStructure: { footer: string } }>(
    getFooterPrompt(themeDesc, theme),
    300,
    {
      htmlStructure: {
        footer: `<footer style="background-color: ${theme.secondaryColor}; padding: 1rem; border-radius: ${theme.rounding}; color: white;">
                  <p>Contact: info@example.com</p>
                  <p>© 2025 Your Company</p>
                </footer>`,
      },
    }
  );
