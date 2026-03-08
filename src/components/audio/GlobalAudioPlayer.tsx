'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/contexts/AudioContext';

export default function GlobalAudioPlayer() {
  const { 
    currentAudio, 
    isPlaying, 
    togglePlayPause, 
    nextTrack, 
    previousTrack 
  } = useAudio();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentAudio && audioRef.current) {
      // Reset time when audio source changes
      setCurrentTime(0);
      audioRef.current.src = currentAudio.audioUrl;
      audioRef.current.load();
      
      // Auto-play if isPlaying is true
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
          });
        }
      }
    }
  }, [currentAudio, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const closePlayer = () => {
    setShowPlayer(false);
  };
  
  // Auto show player when audio is loaded
  useEffect(() => {
    if (currentAudio) {
      setShowPlayer(true);
    }
  }, [currentAudio]);

  if (!currentAudio) return null;

  return (
    <AnimatePresence>
      {showPlayer && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-md"
        >
          <div className="container mx-auto px-4 py-4">
            {/* Progress Bar */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Main Player Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Song Info */}
              <div className="flex items-center space-x-3 w-full md:w-1/4">
                {currentAudio?.coverImage && (
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-secondary shrink-0">
                    <img 
                      src={currentAudio.coverImage} 
                      alt={currentAudio.title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="truncate flex-1">
                  <h4 className="font-medium truncate text-sm">{currentAudio.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{currentAudio.author}</p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={previousTrack}
                  className="h-8 w-8"
                >
                  <SkipBack size={18} />
                </Button>
                <Button 
                  variant="default" 
                  size="icon" 
                  onClick={togglePlayPause}
                  className="h-10 w-10 rounded-full"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={nextTrack}
                  className="h-8 w-8"
                >
                  <SkipForward size={18} />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 w-full md:w-1/4 justify-end">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                  className="h-8 w-8"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closePlayer}
                  className="h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={currentAudio.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={nextTrack}
            crossOrigin="anonymous"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
