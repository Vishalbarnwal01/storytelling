'use server';

/**
 * @fileOverview AI-powered evaluation of creator account applications.
 *
 * - evaluateCreatorApplication - A function that evaluates a creator application.
 * - EvaluateCreatorApplicationInput - The input type for the evaluateCreatorApplication function.
 * - EvaluateCreatorApplicationOutput - The return type for the evaluateCreatorApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCreatorApplicationInputSchema = z.object({
  applicationText: z
    .string()
    .describe('The text of the creator account application.'),
  sampleContent: z
    .string()
    .optional()
    .describe('Optional sample content from the creator.'),
});
export type EvaluateCreatorApplicationInput = z.infer<
  typeof EvaluateCreatorApplicationInputSchema
>;

const EvaluateCreatorApplicationOutputSchema = z.object({
  isSuitable: z.boolean().describe(
    'Whether the creator application is suitable based on content guidelines.'
  ),
  reason: z.string().describe('The reasoning behind the suitability decision.'),
});
export type EvaluateCreatorApplicationOutput = z.infer<
  typeof EvaluateCreatorApplicationOutputSchema
>;

export async function evaluateCreatorApplication(
  input: EvaluateCreatorApplicationInput
): Promise<EvaluateCreatorApplicationOutput> {
  return evaluateCreatorApplicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCreatorApplicationPrompt',
  input: {schema: EvaluateCreatorApplicationInputSchema},
  output: {schema: EvaluateCreatorApplicationOutputSchema},
  prompt: `You are an AI assistant tasked with evaluating creator account applications for an audio story platform.  The platform's content guidelines emphasize high-quality, original audio stories that are appropriate for a general audience.

  Please assess the application based on the provided application text and sample content (if available). Determine if the applicant's content aligns with the platform's guidelines.  Provide a boolean value for isSuitable, and a detailed reason for your decision.

  Application Text: {{{applicationText}}}

  {{#if sampleContent}}
  Sample Content: {{{sampleContent}}}
  {{/if}}
  `,
});

const evaluateCreatorApplicationFlow = ai.defineFlow(
  {
    name: 'evaluateCreatorApplicationFlow',
    inputSchema: EvaluateCreatorApplicationInputSchema,
    outputSchema: EvaluateCreatorApplicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
