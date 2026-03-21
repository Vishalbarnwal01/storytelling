import GlobalAudioPlayer from '@/components/audio/GlobalAudioPlayer';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { AudioProvider } from '@/contexts/AudioContext';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kahaniwaala',
  description: 'An audio story sharing platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AudioProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <GlobalAudioPlayer />
          <Toaster />
        </AudioProvider>
      </body>
    </html>
  );
}
