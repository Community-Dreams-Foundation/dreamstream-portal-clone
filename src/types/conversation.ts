
export interface ThreadMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
  attachments?: {
    type: 'image' | 'document' | 'audio' | 'chart';
    url?: string;
    name?: string;
    previewUrl?: string;
    data?: string; // For inline data (like base64)
  }[];
  mediaToken?: string; // Reference to media content in the message
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messages?: ThreadMessage[];
  category?: 'general' | 'task' | 'learning' | 'archived';
  tags?: string[];
}

export interface VoicePreferences {
  isEnabled: boolean;
  volume: number;
  speed: number;
  voiceId?: string;
}
