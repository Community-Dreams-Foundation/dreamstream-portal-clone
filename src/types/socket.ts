
import { Socket } from 'socket.io-client';

export interface ServerToClientEvents {
  userJoined: (userData: { userId: string; userName: string }) => void;
  userLeft: (userId: string) => void;
  messageReceived: (message: ChatMessage) => void;
  leaderboardUpdate: (leaderboard: LeaderboardEntry[]) => void;
}

export interface ClientToServerEvents {
  message: (message: ChatMessage) => void;
  updateScore: (score: number) => void;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'achievement';
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  avatar?: string;
}

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;
