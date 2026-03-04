import type { Story } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find((img) => img.id === id);

export const stories: Story[] = [
  {
    id: '1',
    title: 'The Echoes of Tomorrow',
    author: 'Jane Doe',
    coverImage: getImage('cover1')?.imageUrl || '',
    imageHint: getImage('cover1')?.imageHint || '',
    audioUrl: '/placeholder.mp3',
    duration: '22:15',
    likes: 1283,
    comments: [
      { id: 'c1-1', author: 'Alex', text: 'Amazing story!', timestamp: '2 days ago', avatar: getImage('avatar1')?.imageUrl || '', avatarHint: getImage('avatar1')?.imageHint || '' },
      { id: 'c1-2', author: 'Maria', text: "Couldn't stop listening.", timestamp: '1 day ago', avatar: getImage('avatar2')?.imageUrl || '', avatarHint: getImage('avatar2')?.imageHint || '' },
    ],
  },
  {
    id: '2',
    title: 'Whispers in the Woods',
    author: 'John Smith',
    coverImage: getImage('cover2')?.imageUrl || '',
    imageHint: getImage('cover2')?.imageHint || '',
    audioUrl: '/placeholder.mp3',
    duration: '18:42',
    likes: 945,
    comments: [
        { id: 'c2-1', author: 'Sam', text: 'So spooky and atmospheric!', timestamp: '5 hours ago', avatar: getImage('avatar3')?.imageUrl || '', avatarHint: getImage('avatar3')?.imageHint || '' },
    ],
  },
  {
    id: '3',
    title: 'Cyber-Neon Dreams',
    author: 'Yuki Tanaka',
    coverImage: getImage('cover3')?.imageUrl || '',
    imageHint: getImage('cover3')?.imageHint || '',
    audioUrl: '/placeholder.mp3',
    duration: '31:05',
    likes: 2104,
    comments: [],
  },
  {
    id: '4',
    title: 'The Last Chronicler',
    author: 'Alistair Finch',
    coverImage: getImage('cover4')?.imageUrl || '',
    imageHint: getImage('cover4')?.imageHint || '',
    audioUrl: '/placeholder.mp3',
    duration: '25:50',
    likes: 750,
    comments: [
        { id: 'c4-1', author: 'Alex', text: 'A classic adventure.', timestamp: '1 week ago', avatar: getImage('avatar1')?.imageUrl || '', avatarHint: getImage('avatar1')?.imageHint || '' },
    ],
  },
  {
    id: '5',
    title: 'Fireside Fables',
    author: 'Eleanor Vance',
    coverImage: getImage('cover5')?.imageUrl || '',
    imageHint: getImage('cover5')?.imageHint || '',
    audioUrl: '/placeholder.mp3',
    duration: '15:20',
    likes: 1523,
    comments: [
        { id: 'c5-1', author: 'Maria', text: 'So cozy and heartwarming!', timestamp: '3 days ago', avatar: getImage('avatar2')?.imageUrl || '', avatarHint: getImage('avatar2')?.imageHint || '' },
    ],
  },
  {
    id: '6',
    title: 'Sands of Time',
    author: 'Omar Al-Jamil',
    coverImage: getImage('cover6')?.imageUrl || '',
    imageHint: getImage('cover6')?.imageHint || '',
    audioUrl: '/placeholder.mp3',
    duration: '28:18',
    likes: 899,
    comments: [],
  },
];

export function getStoryById(id: string | number): Story | undefined {
  return stories.find((story) => story.id === String(id));
}
