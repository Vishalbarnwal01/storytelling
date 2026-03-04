'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Rewind, FastForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const handleRewind = () => {
    if (audioRef.current) audioRef.current.currentTime -= 10;
  };
  
  const handleFastForward = () => {
    if (audioRef.current) audioRef.current.currentTime += 10;
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  }

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <div className="w-full p-4 bg-card/50 rounded-lg shadow-md space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          aria-label="Seek audio"
        />
        <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleRewind} aria-label="Rewind 10 seconds">
          <Rewind />
        </Button>
        <Button variant="default" size="icon" className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90" onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current ml-1" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleFastForward} aria-label="Fast-forward 10 seconds">
          <FastForward />
        </Button>
      </div>

      <div className="flex items-center gap-2 px-8">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8" aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted || volume === 0 ? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.05}
          onValueChange={handleVolumeChange}
          aria-label="Volume control"
        />
      </div>
    </div>
  );
}
