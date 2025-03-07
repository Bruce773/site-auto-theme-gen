import OpenAI from 'openai';
import { Theme } from './components/ThemeContext';

const GPT = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GPT_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

const getMainGenPrompt = ({ themeDesc }: { themeDesc: string }) => {
  return `You are an experienced website designer with a great eye for color palette building and stock image selection to match the content. Your task is to generate a website theme based solely on the description provided below. Ensure every element is cohesive and visually appealing, and let the description guide the entire process.

Return a JSON object representing a website theme with the following exact properties:

{
  "rounding": "string", // Defines the border-radius of elements (e.g., "none", "small", "medium", "large").
  "primaryColor": "string", // Main color for emphasis. Ensure high contrast with the background.
  "secondaryColor": "string", // Accent color that must contrast well with the backgroundColor.
  "borderColor": "string", // Color used for borders that matches the theme's aesthetics.
  "backgroundColor": "string", // Primary background color for the website.
  "mainHeaderSize": "string", // Font size for the main header (between 28px-40px).
  "exampleContent": {
    "exampleText": {
      "header": "string" // Concise header text (4-6 words).
    },
    "exampleImages": {
      "pageBackground": "string", // **Landscape-oriented** background image (width > height).
      "smallHeaderCompanion": "string" // **Square** image (width = height) matching the header theme.
    }
  }
}

**Content Generation Rules:**
- The header text must consist of **4-6 words**.
- The **secondaryColor** must contrast sufficiently with the **backgroundColor** for legibility and aesthetic appeal.
- **mainHeaderSize** should be between **28px and 40px**.

**Image Selection Rules:**
- Generate **3-5 relevant keywords** directly from the **themeDesc**. These keywords should be specific to the description provided, without any added context or assumptions.
  - For example, if the description is "A coffee shop with gold, brown, and green. French cottage feel. Simple and elegant," you would use terms directly from that input such as "coffee shop," "gold," "brown," "green," "French cottage," "simple," and "elegant."
- Use the **Pexels API** (or another stock image source, if necessary) to fetch images based on the **generated_keywords**:
  - **pageBackground**: A **landscape-oriented** image related to the keywords from the description.
  - **smallHeaderCompanion**: A **square** image related to the header text from the description.
- Extract the **direct image URLs** from the \`src.original\` field. Ensure the images match the tone and elements from the **themeDesc**.
- If no suitable images are found, retry fetching using alternative variations of the keywords directly derived from **themeDesc**.

**Example API Call:**
- Fetch: \`https://api.pexels.com/v1/search?query={generated_keywords}&per_page=1\`
- Extract: Use the **first result’s** \`src.original\` field.

**Final Output Format (Example):**
{
  "rounding": "medium",
  "primaryColor": "#1E90FF",
  "secondaryColor": "#FFD700",
  "borderColor": "#CCCCCC",
  "backgroundColor": "#FFFFFF",
  "mainHeaderSize": "32px",
  "exampleContent": {
    "exampleText": {
      "header": "Elegant Minimalist Design"
    },
    "exampleImages": {
      "pageBackground": "https://images.pexels.com/photos/123456/original.jpg",
      "smallHeaderCompanion": "https://images.pexels.com/photos/789012/original.jpg"
    }
  }
}

**Important**: Ensure the response contains **only** the properties you have listed above. Do not include any extra properties in the JSON output. The theme should be based solely on the description: \`${themeDesc}\`.`;
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
