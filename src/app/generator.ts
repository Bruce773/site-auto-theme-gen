import OpenAI from 'openai';
import { Theme } from './components/ThemeContext';

const getMainGenPrompt = ({ themeDesc }: { themeDesc: string }) => {
  return `You are an experienced website designer with a great eye for color palette building and stock image selection to match the content. You are also a design who uses modern styling techniques when styling content on the page. You use modern concepts of padding, corner rounding, spacing, and contrasts. Your task is to generate a website theme based solely on the description provided below. Ensure every element is cohesive and visually appealing, and let the description guide the entire process.

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
    },
    "htmlStructure": {
      "header": "string", // HTML code for the header section (e.g., h1, navigation bar, logo).
      "mainContent": "string", // HTML code for the main content section (e.g., text, images, links).
      "footer": "string" // HTML code for the footer section (e.g., contact info, social media links).
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

**HTML Structure Generation:**
- **header**: Generate HTML for a header section with the following structure (you can adjust it based on the description):
  - Logo or site name ('<h1>' element).
  - A navigation bar ('<nav>' element) with placeholder links.
  - All content should be styled to match the theme and should look visually appealing. Use the primary and secondary colors appropriately.
- **mainContent**: Generate HTML for the main content, which could include:
  - A section for a large hero image with background ('<div>' or '<section>').
  - Text content (use placeholders like "Welcome to our site" or "Discover our coffee shop"). 
  - All content should be styled to match the theme and should look visually appealing. Use the primary and secondary colors appropriately.
  - Example images (e.g., '<img>' tags for the background and companion image).
- **footer**: Generate HTML for a footer with placeholders for contact information, social media links, etc.
- All content should be styled to match the theme and should look visually appealing. Use the primary and secondary colors appropriately.

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
    },
    "htmlStructure": {
      "header": "<header><h1>Elegant Minimalist Design</h1><nav><ul><li><a href='#'>Home</a></li><li><a href='#'>About</a></li><li><a href='#'>Services</a></li><li><a href='#'>Contact</a></li></ul></nav></header>",
      "mainContent": "<section class='hero'><div style='background-image: url(https://images.pexels.com/photos/123456/original.jpg);'><h2>Welcome to Our Coffee Shop</h2></div><p>Discover the charm of a French cottage-style cafe.</p></section>",
      "footer": "<footer><p>Contact Us: info@coffeeshop.com</p><ul><li><a href='#'>Facebook</a></li><li><a href='#'>Instagram</a></li><li><a href='#'>Twitter</a></li></ul></footer>"
    }
  }
}

**Important**: Ensure the response contains **only** the properties you have listed above. Do not include any extra properties in the JSON output. The theme and HTML structure should be based solely on the description: \`${themeDesc}\`.`;
};

export const generateTheme = async ({ themeDesc }: { themeDesc: string }) => {
  try {
    const GPT = new OpenAI({
      baseURL: 'https://api.x.ai/v1',
      apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY, // Keep this server-side
      dangerouslyAllowBrowser: true,
    });

    const completion = await GPT.chat.completions.create({
      model: 'grok-2-1212', // Verify with xAI console; could be 'grok-3'
      messages: [{ role: 'user', content: getMainGenPrompt({ themeDesc }) }],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' }, // Ensures JSON output
    });

    if (!completion.choices || !completion.choices[0]?.message.content) {
      throw new Error('No valid response from the AI model.');
    }

    const results = JSON.parse(
      completion.choices[0].message.content as string
    ) as Theme;

    return results;
  } catch (error) {
    console.error('Error generating theme:', error);
    throw new Error('Failed to generate theme. Please try again later.');
  }
};
