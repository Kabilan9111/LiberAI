export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export type PersonalityMode =
  | "chill"
  | "savage"
  | "romantic"
  | "motivational"
  | "study_coach"
  | "tamil_local";

export type Language =
  | "english"
  | "tamil"
  | "telugu"
  | "malayalam"
  | "kannada"
  | "hindi"
  | "marathi";

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  personalityMode: PersonalityMode;
  language: Language;
  createdAt: Date;
}

export interface User {
  email: string;
  username: string;
}

export type ImageStyle =
  | "realistic"
  | "anime"
  | "cinematic"
  | "cyberpunk"
  | "fantasy"
  | "dark_mode";

export type AspectRatio = "1:1" | "16:9" | "3:4";

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  style: ImageStyle;
  aspectRatio: AspectRatio;
  createdAt: Date;
}

export interface PersonalitySettings {
  creativity: number; // 0 to 100
  humor: number;      // 0 to 100
  formalCasual: number; // 0 to 100 (0 formal, 100 casual)
  responsePreset: "concise" | "balanced" | "detailed";
}
