
'use server';

import { generateMotivationalQuote } from '@/ai/flows/motivational-quote-generator';
import { z } from 'zod';

const GetNewQuoteOutputSchema = z.object({
  quote: z.string(),
});

export async function getNewQuote(): Promise<z.infer<typeof GetNewQuoteOutputSchema>> {
  try {
    const { quote } = await generateMotivationalQuote();
    return { quote };
  } catch (error) {
    console.error("Error generating quote:", error);
    return { quote: "Could not fetch a new quote. Please try again." };
  }
}
