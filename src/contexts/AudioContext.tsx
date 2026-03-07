'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Song {
  id: number;
  title: string;
  author: string;
  coverImage?: string;
  audioUrl: string;
}

interface AudioContextType {
  currentAudio: Song | null;
  isPlaying: boolean;
  playlist: Song[];
  currentTrackIndex: number;
  togglePlayPause: () => void;
  playSong: (song: Song, playlist?: Song[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setCurrentTime: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playSong = useCallback((song: Song, playlistSongs?: Song[]) => {
    setCurrentAudio(song);
    setIsPlaying(true);
    if (playlistSongs) {
      setPlaylist(playlistSongs);
      const index = playlistSongs.findIndex(s => s.id === song.id);
      setCurrentTrackIndex(index >= 0 ? index : 0);
    } else {
      setPlaylist([song]);
      setCurrentTrackIndex(0);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentAudio(playlist[nextIndex]);
    setIsPlaying(true);
  }, [playlist, currentTrackIndex]);

  const previousTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentAudio(playlist[prevIndex]);
    setIsPlaying(true);
  }, [playlist, currentTrackIndex]);

  const value: AudioContextType = {
    currentAudio,
    isPlaying,
    playlist,
    currentTrackIndex,
    togglePlayPause,
    playSong,
    nextTrack,
    previousTrack,
    setCurrentTime: () => {},
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
