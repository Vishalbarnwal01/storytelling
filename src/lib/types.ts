export interface Story {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  imageHint: string;
  audioUrl: string;
  duration: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  avatar: string;
  avatarHint: string;
}
