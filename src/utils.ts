// utils.ts
import OpenAI from 'openai';

export const initializeAIClient = (): OpenAI => {
  return new OpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey: process.env.NEXT_PUBLIC_XAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
};

export const withRetry = async <T>(
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

export const callApiAndParse = async <T>(
  prompt: string,
  maxTokens: number,
  fallback: T,
  model: string = 'grok-2-1212'
): Promise<T> => {
  try {
    const GPT = initializeAIClient();
    const completion = await withRetry(() =>
      GPT.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    );

    const rawResponse = completion.choices?.[0]?.message.content;
    if (!rawResponse) throw new Error('No valid response from AI');

    return JSON.parse(rawResponse) as T;
  } catch (error) {
    console.error('API error:', error);
    return fallback;
  }
};
