import OpenAI from 'openai';
import { Theme } from './components/ThemeContext';

const GPT = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GPT_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

const getMainGenPrompt = ({ themeDesc }: { themeDesc: string }) => {
  return `Return a website theme with the following properties:
  
  {rounding: string;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  backgroundColor: string;
  mainHeaderSize: string;
  exampleContent: {
    exampleText: { header: string; };
    exampleImages: { pageBackground: string; smallHeaderCompanion: string };
  }}

  Create some example content that would fit this theme. The header text should be no more than 5 words.
  
  Generate a list of 3-5 keywords based on the theme description and use those for the pageBackground image query.

  Use the Pexels API to fetch images, extract the 'src.original' field from the response, and return only **fully resolved image URLs**.

  **Do NOT return API call URLs. Only return extracted image URLs.**

  Example API call:
  - Fetch: "https://api.pexels.com/v1/search?query={generated_keywords}&per_page=1"
  - Extract: Use the first result's 'src.original' field as the image URL.

  Updated exampleImages structure:
  - pageBackground: "{Extracted Image URL from Pexels API}"
  - smallHeaderCompanion: "{Extracted Image URL from Pexels API using exampleText.header}"

  Make sure the returned JSON object contains **only direct image URLs**, so they can be used in a Next.js Image component without any extra processing.

  Replace {exampleText.header} with the actual header text from the example content when making the API request.
  Replace {generated_keywords} with the 3-5 keywords extracted from the theme description.

  Return a JSON object containing those properties. Base the entire theme on this description: ${themeDesc}`;
};

export const generateTheme = async ({ themeDesc }: { themeDesc: string }) => {
  const completion = await GPT.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: getMainGenPrompt({ themeDesc }) }],
    response_format: { type: 'json_object' },
  });

  const results = JSON.parse(
    completion.choices[0]?.message?.content as string
  ) as Theme;

  return results;
};
