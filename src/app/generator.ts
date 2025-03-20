import OpenAI from 'openai';

// Base AI client setup
const initializeAIClient = (): OpenAI => {
  return new OpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
};

// Define TypeScript interfaces for the expected return types
export interface BaseTheme {
  rounding: 'none' | 'small' | 'medium' | 'large' | string;
  primaryColor: string; // Hex color code
  secondaryColor: string; // Hex color code
  borderColor: string; // Hex color code
  backgroundColor: string; // Hex color code
  mainHeaderSize: string; // CSS size value between 28px-40px
}

export interface ExampleText {
  header: string; // 4-6 words
}

export interface ExampleImages {
  pageBackground: string; // URL to landscape image
  smallHeaderCompanion: string; // URL to square image
}

export interface HtmlStructure {
  header?: string; // HTML string for header
  mainContent?: string; // HTML string for main content
  footer?: string; // HTML string for footer
}

// Theme generation prompt
const getThemePrompt = (themeDesc: string): string => `
  You are an experienced website designer with expertise in color palettes and modern styling.
  Based solely on this description: "${themeDesc}", return a JSON object with:
  {
    "rounding": "string", // "none", "small", "medium", "large", or custom px value
    "primaryColor": "string", // High contrast with background
    "secondaryColor": "string", // Contrasts with background
    "borderColor": "string", // Matches theme
    "backgroundColor": "string", // Primary background
    "mainHeaderSize": "string" // 28px-40px
  }
  Ensure cohesive and visually appealing choices.
`;

// Content generation prompt
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

// Images generation prompt
const getImagesPrompt = (themeDesc: string): string => `
  For "${themeDesc}", generate 3-5 keywords from the description.
  Using these keywords with the Pexels API, return a JSON object with:
  {
    "exampleImages": {
      "pageBackground": "string", // Landscape image URL
      "smallHeaderCompanion": "string" // Square image URL
    }
  }
  Use src.original from Pexels. Ensure images match the description's tone.
`;

// HTML structure prompts
const getHeaderPrompt = (
  themeDesc: string,
  theme: BaseTheme,
  headerText: string
): string => `
  For "${themeDesc}" with theme ${JSON.stringify(
  theme
)} and header "${headerText}", return:
  {
    "htmlStructure": {
      "header": "string" // HTML with h1 logo and nav bar
    }
  }
  Style with theme colors, modern padding, and rounding.
`;

const getMainContentPrompt = (
  themeDesc: string,
  theme: BaseTheme,
  images: ExampleImages
): string => `
  For "${themeDesc}" with theme ${JSON.stringify(
  theme
)} and images ${JSON.stringify(images)}, return:
  {
    "htmlStructure": {
      "mainContent": "string" // HTML with hero image and text
    }
  }
  Style with theme colors, modern spacing, and include images.
`;

const getFooterPrompt = (themeDesc: string, theme: BaseTheme): string => `
  For "${themeDesc}" with theme ${JSON.stringify(theme)}, return:
  {
    "htmlStructure": {
      "footer": "string" // HTML with contact and social links
    }
  }
  Style with theme colors and modern design.
`;

// Individual generation functions with explicit typing
export async function generateBaseTheme(themeDesc: string): Promise<BaseTheme> {
  try {
    const GPT = initializeAIClient();
    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212',
      messages: [{ role: 'user', content: getThemePrompt(themeDesc) }],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as BaseTheme;
    return result;
  } catch (error) {
    console.error('Error generating base theme:', error);
    throw new Error('Failed to generate base theme. Please try again later.');
  }
}

export async function generateContent(
  themeDesc: string,
  theme: BaseTheme
): Promise<{ exampleText: ExampleText }> {
  try {
    const GPT = initializeAIClient();
    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212',
      messages: [{ role: 'user', content: getContentPrompt(themeDesc, theme) }],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { exampleText: ExampleText };
    return result;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again later.');
  }
}

export async function generateImages(
  themeDesc: string
): Promise<{ exampleImages: ExampleImages }> {
  try {
    const GPT = initializeAIClient();
    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212',
      messages: [{ role: 'user', content: getImagesPrompt(themeDesc) }],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { exampleImages: ExampleImages };
    return result;
  } catch (error) {
    console.error('Error generating images:', error);
    throw new Error('Failed to generate images. Please try again later.');
  }
}

export async function generateHeader(
  themeDesc: string,
  theme: BaseTheme,
  headerText: string
): Promise<{ htmlStructure: { header: string } }> {
  try {
    const GPT = initializeAIClient();
    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212',
      messages: [
        {
          role: 'user',
          content: getHeaderPrompt(themeDesc, theme, headerText),
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { htmlStructure: { header: string } };
    return result;
  } catch (error) {
    console.error('Error generating header:', error);
    throw new Error('Failed to generate header. Please try again later.');
  }
}

export async function generateMainContent(
  themeDesc: string,
  theme: BaseTheme,
  images: ExampleImages
): Promise<{ htmlStructure: { mainContent: string } }> {
  try {
    const GPT = initializeAIClient();
    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212',
      messages: [
        {
          role: 'user',
          content: getMainContentPrompt(themeDesc, theme, images),
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { htmlStructure: { mainContent: string } };
    return result;
  } catch (error) {
    console.error('Error generating main content:', error);
    throw new Error('Failed to generate main content. Please try again later.');
  }
}

export async function generateFooter(
  themeDesc: string,
  theme: BaseTheme
): Promise<{ htmlStructure: { footer: string } }> {
  try {
    const GPT = initializeAIClient();
    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212',
      messages: [{ role: 'user', content: getFooterPrompt(themeDesc, theme) }],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { htmlStructure: { footer: string } };
    return result;
  } catch (error) {
    console.error('Error generating footer:', error);
    throw new Error('Failed to generate footer. Please try again later.');
  }
}
