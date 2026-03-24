'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Headphones, Upload, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoryCard from '@/components/audio/StoryCard';
import Footer from '@/components/layout/Footer';
import type { Story } from '@/lib/types';
import Image from "next/image";

export default function Home() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleShareStory = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    router.push('/upload');
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        const url = user?.id 
          ? `/api/stories?ts=${Date.now()}&userId=${user.id}`
          : `/api/stories?ts=${Date.now()}`;

        const response = await fetch(url, {
          cache: "no-store"
        });

        if (response.ok) {
          const data = await response.json();
          // Transform API data to Story interface
          const transformedStories: Story[] = (data.stories || []).map((story: any) => ({
            id: story.id.toString(),
            title: story.title,
            author: story.creator_name ? story.creator_name : "John Doe",
            coverImage: story.thumbnail_path ? `/uploads/${story.thumbnail_path}` : '/placeholder.jpg',
            imageHint: 'story cover',
            audioUrl: story.audio_path ? `/uploads/${story.audio_path}` : '',
            duration: '00:00',
            likes: story.likes || 0,
            comments: [],
            commentCount: story.comment_count || 0,
            isLiked: story.user_has_liked === 1 || story.user_has_liked === true,
            user_id: story.user_id || 0,
          }));
          setAllStories(transformedStories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Get featured and trending stories
  const featuredStories = allStories.slice(0, 3);
  const trendingStories = [...allStories].sort((a, b) => b.likes - a.likes).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-16 container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl py-20 md:py-28 px-6 md:px-12 bg-[#0B0A10]">

          {/* Background Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,#3B1E77_0%,#1B0F3A_45%,#0B0A10_100%)]" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Left */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#8A5CF5]">
                Share Your Voice, <br />
                Tell Your Story
              </h1>

              <p className="text-lg text-gray-400 max-w-lg">
                Join our community of storytellers and listeners. Upload your audio stories, discover new voices, and connect through the power of sound.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#6E27D9] hover:bg-[#6E27D9]" asChild size="lg">
                  <Link href="/explore">
                    <Play size={18} className="mr-2" />
                    Explore Stories
                  </Link>
                </Button>

                <Button className="bg-[#09090B] hover:bg-[#09090B] hover:text-white hover:shadow-none transition-none" onClick={handleShareStory} size="lg">
                  <Upload size={18} className="mr-2" />
                  Share Your Story
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="relative hidden md:block">
              
              <div className="relative z-10 w-full max-w-[540px] mx-auto">
                <img
                  src="/images/rcording.avif"
                  alt="Person recording audio"
                  className="rounded-xl shadow-[0_0_80px_rgba(138,92,245,0.2)] w-full h-auto object-contain"
                />
              </div>

              <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#8A5CF5]/25 rounded-full blur-[140px] -z-10" />
            </div>

          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured Stories */}
            {featuredStories.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Featured Stories</h2>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/explore">View All</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {featuredStories.map((story) => (
                    <StoryCard key={story.id} story={story} playlist={allStories} />
                  ))}
                </div>
              </section>
            )}

            {/* How It Works */}
            <section className="space-y-8">
              <h2 className="text-2xl font-bold text-center">How It Works</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Headphones size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Create</h3>
                  <p className="text-muted-foreground">Record your story, poem, or podcast using any audio recording tool.</p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Upload</h3>
                  <p className="text-muted-foreground">Share your audio with our community in just a few clicks.</p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
                  <div className="p-4 rounded-full bg-primary/10">
                    <TrendingUp size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Connect</h3>
                  <p className="text-muted-foreground">Engage with listeners through comments and build your audience.</p>
                </div>
              </div>
            </section>

            {/* Trending Now */}
            {trendingStories.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Trending Now</h2>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/explore">View All</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {trendingStories.map((story) => (
                    <StoryCard key={story.id} story={story} playlist={allStories} />
                  ))}
                </div>
              </section>
            )}

            {/* CTA Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/70 py-12 text-white -mx-4 md:-mx-6 px-6 md:px-12">
              <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold">Ready to Share Your Story?</h2>
                <p className="text-white/80">Join thousands of storytellers who are sharing their voices with the world.</p>
                <Button 
                    className="bg-[#09090B] border-0 hover:bg-[#09090B] hover:text-white hover:shadow-none transition-none"
                    onClick={handleShareStory} 
                    size="lg"
                  >
                  Get Started
                </Button>
              </div>

              <div className="absolute top-0 right-0 w-full h-full">
                <svg className="absolute right-0 top-0 h-full w-1/2 opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,0 L100,100 Z" fill="white" />
                </svg>
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
