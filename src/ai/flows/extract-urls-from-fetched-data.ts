'use server';
/**
 * @fileOverview Extracts URLs from fetched data using AI.
 *
 * - extractUrlsFromFetchedData - A function that extracts URLs from fetched data.
 * - ExtractUrlsFromFetchedDataInput - The input type for the extractUrlsFromFetchedData function.
 * - ExtractUrlsFromFetchedDataOutput - The return type for the extractUrlsFromFetchedData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractUrlsFromFetchedDataInputSchema = z.object({
  fetchedData: z.string().describe('The data fetched from the URL.'),
});
export type ExtractUrlsFromFetchedDataInput = z.infer<typeof ExtractUrlsFromFetchedDataInputSchema>;

const ExtractUrlsFromFetchedDataOutputSchema = z.object({
  urls: z.array(z.string()).describe('An array of URLs extracted from the fetched data.'),
});
export type ExtractUrlsFromFetchedDataOutput = z.infer<typeof ExtractUrlsFromFetchedDataOutputSchema>;

export async function extractUrlsFromFetchedData(input: ExtractUrlsFromFetchedDataInput): Promise<ExtractUrlsFromFetchedDataOutput> {
  return extractUrlsFromFetchedDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractUrlsFromFetchedDataPrompt',
  input: {schema: ExtractUrlsFromFetchedDataInputSchema},
  output: {schema: ExtractUrlsFromFetchedDataOutputSchema},
  prompt: `You are an expert web data extractor. Your task is to extract all valid URLs from the following fetched data. Return them as an array of strings.

Fetched Data:
{{{fetchedData}}}`,
});

const extractUrlsFromFetchedDataFlow = ai.defineFlow(
  {
    name: 'extractUrlsFromFetchedDataFlow',
    inputSchema: ExtractUrlsFromFetchedDataInputSchema,
    outputSchema: ExtractUrlsFromFetchedDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
