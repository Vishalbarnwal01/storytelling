'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function UploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const categories = [
    { id: 'true-crime', name: 'True Crime' },
    { id: 'mystery-thriller', name: 'Mystery & Thriller' },
    { id: 'science-fiction', name: 'Science Fiction' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'romance', name: 'Romance' },
    { id: 'horror-paranormal', name: 'Horror & Paranormal' },
    { id: 'historical-fiction', name: 'Historical Fiction' },
    { id: 'biography', name: 'Biography' },
    { id: 'action-adventure', name: 'Action & Adventure' },
    { id: 'comedy-satire', name: 'Comedy & Satire' },
    { id: 'suspenseful', name: 'Suspenseful' },
    { id: 'inspirational', name: 'Inspirational' },
    { id: 'mythology', name: 'Mythology' },
  ];
  const [uploadCategory, setUploadCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const audioFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  function handleAudioFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is audio
      if (!file.type.startsWith('audio/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please select a valid audio file',
        });
        return;
      }
      setAudioFileName(file.name);
    } else {
      setAudioFileName(null);
    }
  }

  function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is JPG or PNG only
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Only JPG and PNG images are allowed',
        });
        event.target.value = '';
        return;
      }

      setThumbnailFileName(file.name);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailFileName(null);
      setThumbnailPreview(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = (event.currentTarget.elements.namedItem('title') as HTMLInputElement)?.value;
    const description = (event.currentTarget.elements.namedItem('description') as HTMLTextAreaElement)?.value;
    const audioFile = audioFileRef.current?.files?.[0];
    const thumbnailFile = thumbnailFileRef.current?.files?.[0];

    // Validation
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Title',
        description: 'Please enter a story title',
      });
      return;
    }
    if (!uploadCategory) {
      toast({
        variant: 'destructive',
        title: 'Missing Category',
        description: 'Please select a category',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Description',
        description: 'Please enter a story description',
      });
      return;
    }

    if (!uploadCategory) {
      toast({
        variant: 'destructive',
        title: 'Missing Category',
        description: 'Please select a category',
      });
      return;
    }

    if (!audioFile) {
      toast({
        variant: 'destructive',
        title: 'Missing Audio',
        description: 'Please select an audio file',
      });
      return;
    }

    if (!thumbnailFile) {
      toast({
        variant: 'destructive',
        title: 'Missing Thumbnail',
        description: 'Please select a thumbnail image',
      });
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', uploadCategory);
      formData.append('audio', audioFile);
      formData.append('thumbnail', thumbnailFile);

      console.log(formData);
      // Get user ID from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(storedUser);
      formData.append('userId', user.id.toString());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log(response);
      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: data.error || 'An unexpected error occurred.',
        });
        return;
      }

      toast({
        title: 'Success!',
        description: 'Your story has been uploaded and is pending approval.',
      });

      // Reset form properly
      if (audioFileRef.current) audioFileRef.current.value = '';
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
      (event.target as HTMLFormElement).reset();
      setAudioFileName(null);
      setThumbnailFileName(null);
      setThumbnailPreview(null);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Upload New Story</CardTitle>
          <CardDescription>
            Share your next masterpiece with the Kahaniwaala community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Story Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="The Echoes of Tomorrow"
                required
                disabled={isLoading}
              />
            </div>

            {/**Select Category */}
            <div className='space-y-2'>
              <Label htmlFor="category">Select Category *</Label>

              <Select
                value={uploadCategory}
                onValueChange={(value) => setUploadCategory(value)}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A short summary of your story..."
                required
                disabled={isLoading}
                rows={4}
              />
            </div>

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image (JPG, PNG) *</Label>
              <div className="relative flex items-center justify-center w-full">
                <label
                  htmlFor="thumbnail"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors"
                >
                  {thumbnailPreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={thumbnailPreview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB)</p>
                    </div>
                  )}
                  <Input
                    id="thumbnail"
                    ref={thumbnailFileRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleThumbnailChange}
                    disabled={isLoading}
                    required
                  />
                </label>
              </div>
              {thumbnailFileName && (
                <p className="text-sm text-muted-foreground">Selected: {thumbnailFileName}</p>
              )}
            </div>

            {/* Audio File */}
            <div className="space-y-2">
              <Label htmlFor="audio">Audio File (MP3, WAV, M4A, FLAC) *</Label>
              <div className="relative flex items-center justify-center w-full">
                <label
                  htmlFor="audio"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    {audioFileName ? (
                      <p className="font-semibold text-accent">{audioFileName}</p>
                    ) : (
                      <>
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">MP3, WAV, M4A, FLAC (Max 50MB)</p>
                      </>
                    )}
                  </div>
                  <Input
                    id="audio"
                    ref={audioFileRef}
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    disabled={isLoading}
                    required
                  />
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Uploading...' : 'Upload Story'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upload Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Uploading Your Story...</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Please wait while we process your audio and image.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
