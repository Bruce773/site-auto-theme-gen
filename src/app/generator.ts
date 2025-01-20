import OpenAI from 'openai';
import { Theme } from './components/ThemeContext';

const GPT = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GPT_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

const getMainGenPrompt = ({ themeDesc }: { themeDesc: string }) => {
  return `Return a website theme with the following properties: rounding: string primaryColor: string; secondaryColor: string; borderColor: string; backgroundColor: string; mainHeaderSize: string; exampleText: { header: string } Return a JSON object containing those properties. Use this description for inspiration: ${themeDesc}`;
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
