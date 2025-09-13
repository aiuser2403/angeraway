'use server';

/**
 * @fileOverview A motivational quote generator AI agent.
 *
 * - generateMotivationalQuote - A function that generates a motivational quote.
 * - MotivationalQuoteOutput - The return type for the generateMotivationalQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalQuoteOutputSchema = z.object({
  quote: z.string().describe('A motivational quote to help the user feel better.'),
});
export type MotivationalQuoteOutput = z.infer<typeof MotivationalQuoteOutputSchema>;

export async function generateMotivationalQuote(): Promise<MotivationalQuoteOutput> {
  return motivationalQuoteFlow();
}

const prompt = ai.definePrompt({
  name: 'motivationalQuotePrompt',
  output: {schema: MotivationalQuoteOutputSchema},
  prompt: `You are a motivational quote generator.  Generate a quote to make the user feel better.  The quote should be short and positive.`,
});

const motivationalQuoteFlow = ai.defineFlow(
  {
    name: 'motivationalQuoteFlow',
    outputSchema: MotivationalQuoteOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
