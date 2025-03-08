
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Define the events we'll be handling
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MEETING_CREATED = 'meeting:created',
  MEETING_UPDATED = 'meeting:updated',
  MEETING_DELETED = 'meeting:deleted',
  MEETING_REMINDER = 'meeting:reminder',
  RECORDING_READY = 'recording:ready',
  TRANSCRIPT_READY = 'transcript:ready'
}

// Singleton pattern for the socket instance
let socket: Socket | null = null;

// Initialize the socket connection
export const initializeSocket = (userId: string): Socket => {
  if (!socket) {
    // Replace with your actual Socket.IO server URL
    const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3001';
    
    socket = io(SOCKET_URL, {
      auth: {
        userId
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on(SocketEvent.CONNECT, () => {
      console.log('Socket connected:', socket?.id);
    });
    
    socket.on(SocketEvent.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  
  return socket;
};

// Close the socket connection
export const closeSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// React hook for managing socket connection
export const useSocket = (userId?: string) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  useEffect(() => {
    if (!userId) return;
    
    const socketInstance = initializeSocket(userId);
    
    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
    };
    
    socketInstance.on(SocketEvent.CONNECT, onConnect);
    socketInstance.on(SocketEvent.DISCONNECT, onDisconnect);
    
    // Set initial connection state
    setIsConnected(socketInstance.connected);
    
    return () => {
      socketInstance.off(SocketEvent.CONNECT, onConnect);
      socketInstance.off(SocketEvent.DISCONNECT, onDisconnect);
    };
  }, [userId]);
  
  return { socket, isConnected };
};

// React hook for subscribing to meeting events
export const useMeetingEvents = (
  onMeetingCreated?: (data: any) => void,
  onMeetingUpdated?: (data: any) => void,
  onMeetingDeleted?: (data: any) => void,
  onMeetingReminder?: (data: any) => void,
  onRecordingReady?: (data: any) => void,
  onTranscriptReady?: (data: any) => void
) => {
  useEffect(() => {
    if (!socket) return;
    
    if (onMeetingCreated) {
      socket.on(SocketEvent.MEETING_CREATED, onMeetingCreated);
    }
    
    if (onMeetingUpdated) {
      socket.on(SocketEvent.MEETING_UPDATED, onMeetingUpdated);
    }
    
    if (onMeetingDeleted) {
      socket.on(SocketEvent.MEETING_DELETED, onMeetingDeleted);
    }
    
    if (onMeetingReminder) {
      socket.on(SocketEvent.MEETING_REMINDER, onMeetingReminder);
    }
    
    if (onRecordingReady) {
      socket.on(SocketEvent.RECORDING_READY, onRecordingReady);
    }
    
    if (onTranscriptReady) {
      socket.on(SocketEvent.TRANSCRIPT_READY, onTranscriptReady);
    }
    
    return () => {
      if (onMeetingCreated) {
        socket.off(SocketEvent.MEETING_CREATED, onMeetingCreated);
      }
      
      if (onMeetingUpdated) {
        socket.off(SocketEvent.MEETING_UPDATED, onMeetingUpdated);
      }
      
      if (onMeetingDeleted) {
        socket.off(SocketEvent.MEETING_DELETED, onMeetingDeleted);
      }
      
      if (onMeetingReminder) {
        socket.off(SocketEvent.MEETING_REMINDER, onMeetingReminder);
      }
      
      if (onRecordingReady) {
        socket.off(SocketEvent.RECORDING_READY, onRecordingReady);
      }
      
      if (onTranscriptReady) {
        socket.off(SocketEvent.TRANSCRIPT_READY, onTranscriptReady);
      }
    };
  }, [
    onMeetingCreated,
    onMeetingUpdated,
    onMeetingDeleted,
    onMeetingReminder,
    onRecordingReady,
    onTranscriptReady
  ]);
};

// Emit meeting events
export const emitMeetingCreated = (meetingData: any): void => {
  if (socket) {
    socket.emit(SocketEvent.MEETING_CREATED, meetingData);
  }
};

export const emitMeetingUpdated = (meetingData: any): void => {
  if (socket) {
    socket.emit(SocketEvent.MEETING_UPDATED, meetingData);
  }
};

export const emitMeetingDeleted = (meetingId: string): void => {
  if (socket) {
    socket.emit(SocketEvent.MEETING_DELETED, { meetingId });
  }
};

export const emitRecordingReady = (meetingId: string, recordingUrl: string): void => {
  if (socket) {
    socket.emit(SocketEvent.RECORDING_READY, { meetingId, recordingUrl });
  }
};

export const emitTranscriptReady = (meetingId: string, transcriptUrl: string): void => {
  if (socket) {
    socket.emit(SocketEvent.TRANSCRIPT_READY, { meetingId, transcriptUrl });
  }
};
