'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleApply } from '@/app/apply/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  applicationText: z.string().min(50, {
    message: 'Please tell us more about yourself and your content (min 50 characters).',
  }),
  sampleContent: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

type ResultState = {
  isSuitable: boolean;
  reason: string;
} | null;

export default function CreatorApplicationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationText: '',
      sampleContent: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const response = await handleApply(values);
      setResult(response);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not submit application. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="applicationText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tell us about you and your stories</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., I am a fantasy author who creates immersive audio dramas with full cast and sound design..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe the kind of audio content you create or plan to create.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sampleContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Content (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormDescription>
                  Link to your portfolio, YouTube, podcast, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Evaluating...' : 'Submit Application'}
          </Button>
        </form>
      </Form>
      
      <AlertDialog open={!!result} onOpenChange={() => setResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              {result?.isSuitable ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>
            <AlertDialogTitle className="text-center text-2xl font-headline">
              {result?.isSuitable ? 'Application Approved!' : 'Application Needs Review'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {result?.reason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setResult(null); if(result?.isSuitable) form.reset(); } }>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
