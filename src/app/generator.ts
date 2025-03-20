import OpenAI from 'openai';

// Define TypeScript interfaces for the expected return types
export interface BaseTheme {
  rounding: 'none' | 'small' | 'medium' | 'large';
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  backgroundColor: string;
  mainHeaderSize: string;
}

export interface ExampleText {
  header: string;
}

export interface ExampleImages {
  pageBackground: string;
  smallHeaderCompanion: string;
}

export interface HtmlStructure {
  header?: string;
  mainContent?: string;
  footer?: string;
}

// Base AI client setup with retry logic
const initializeAIClient = (): OpenAI => {
  return new OpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
};

// Utility function for retrying API calls
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
};

// Prompt functions (unchanged for brevity)
const getThemePrompt = (themeDesc: string): string => `
  You are an experienced website designer with expertise in color palettes and modern styling.
  Based solely on this description: "${themeDesc}", return a JSON object with:
  {
    "rounding": "string", // "none", "small", "medium", "large"
    "primaryColor": "string", // High contrast with background
    "secondaryColor": "string", // Contrasts with background
    "borderColor": "string", // Matches theme
    "backgroundColor": "string", // Primary background
    "mainHeaderSize": "string" // 28px-40px
  }
  Ensure cohesive and visually appealing choices.
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
      "header": "string" // HTML with h1 logo and nav bar
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

// Generation functions with improved error handling
export async function generateBaseTheme(themeDesc: string): Promise<BaseTheme> {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
        model: 'grok-2-1212',
        messages: [{ role: 'user', content: getThemePrompt(themeDesc) }],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    );

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model for base theme');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as BaseTheme;
    return result;
  } catch (error) {
    console.error('Error generating base theme:', error);
    throw new Error(
      'Failed to generate base theme: ' + (error as Error).message
    );
  }
}

export async function generateContent(
  themeDesc: string,
  theme: BaseTheme
): Promise<{ exampleText: ExampleText }> {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          { role: 'user', content: getContentPrompt(themeDesc, theme) },
        ],
        max_tokens: 300,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    );

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model for content');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { exampleText: ExampleText };
    return result;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content: ' + (error as Error).message);
  }
}

export async function generateImages(
  themeDesc: string
): Promise<{ exampleImages: ExampleImages }> {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
        model: 'grok-2-1212',
        messages: [{ role: 'user', content: getImagesPrompt(themeDesc) }],
        max_tokens: 400,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    );

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model for images');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { exampleImages: ExampleImages };
    return result;
  } catch (error) {
    console.error('Error generating images:', error);
    throw new Error('Failed to generate images: ' + (error as Error).message);
  }
}

export async function generateHeader(
  themeDesc: string,
  theme: BaseTheme,
  headerText: string
): Promise<{ htmlStructure: { header: string } }> {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
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
      })
    );

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model for header');
    }

    const rawResponse = completion.choices[0].message.content as string;
    console.log('Raw header response:', rawResponse); // Debug log

    // Validate JSON before parsing
    try {
      const result = JSON.parse(rawResponse) as {
        htmlStructure: { header: string };
      };

      // Validate the structure
      if (
        !result.htmlStructure ||
        typeof result.htmlStructure.header !== 'string'
      ) {
        throw new Error('Invalid header structure in response');
      }

      return result;
    } catch (parseError) {
      console.error('Failed to parse header response:', parseError);
      // Fallback header
      return {
        htmlStructure: {
          header: `<header style="background-color: ${theme.primaryColor}; padding: 1rem; border-radius: ${theme.rounding}; color: white;">
                    <h1>${headerText}</h1>
                    <nav>
                      <ul style="list-style: none; display: flex; gap: 1rem;">
                        <li><a href="#" style="color: white;">Home</a></li>
                        <li><a href="#" style="color: white;">About</a></li>
                        <li><a href="#" style="color: white;">Services</a></li>
                        <li><a href="#" style="color: white;">Contact</a></li>
                      </ul>
                    </nav>
                  </header>`,
        },
      };
    }
  } catch (error) {
    console.error('Error generating header:', error);
    throw new Error('Failed to generate header: ' + (error as Error).message);
  }
}

export async function generateMainContent(
  themeDesc: string,
  theme: BaseTheme,
  images: ExampleImages
): Promise<{ htmlStructure: { mainContent: string } }> {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
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
      })
    );

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model for main content');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { htmlStructure: { mainContent: string } };
    return result;
  } catch (error) {
    console.error('Error generating main content:', error);
    throw new Error(
      'Failed to generate main content: ' + (error as Error).message
    );
  }
}

export async function generateFooter(
  themeDesc: string,
  theme: BaseTheme
): Promise<{ htmlStructure: { footer: string } }> {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          { role: 'user', content: getFooterPrompt(themeDesc, theme) },
        ],
        max_tokens: 300,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    );

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model for footer');
    }

    const result = JSON.parse(
      completion.choices[0].message.content as string
    ) as { htmlStructure: { footer: string } };
    return result;
  } catch (error) {
    console.error('Error generating footer:', error);
    throw new Error('Failed to generate footer: ' + (error as Error).message);
  }
}
