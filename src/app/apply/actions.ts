'use server';

import { 
  evaluateCreatorApplication, 
  type EvaluateCreatorApplicationInput, 
  type EvaluateCreatorApplicationOutput 
} from '@/ai/flows/evaluate-creator-application';
import { z } from 'zod';

const FormSchema = z.object({
  applicationText: z.string().min(1, 'Application text is required.'),
  sampleContent: z.string().optional(),
});

export async function handleApply(
  data: EvaluateCreatorApplicationInput
): Promise<EvaluateCreatorApplicationOutput> {

  const validatedData = FormSchema.parse(data);

  // In a real app, you might save the application to a database here.
  
  const result = await evaluateCreatorApplication(validatedData);
  return result;
}
