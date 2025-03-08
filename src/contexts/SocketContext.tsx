
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import SocketService from '@/utils/socketService';

interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
  lastError: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setIsConnected(false);
      return;
    }

    try {
      console.log('Initializing socket connection...');
      
      // Initialize socket connection
      SocketService.connect(currentUser.uid);
      setIsConnected(true);
      
      // Setup event listeners
      const socketEventHandler = (event: CustomEvent) => {
        const { type, data } = event.detail;
        
        switch (type) {
          case 'connected':
            setIsConnected(true);
            toast({
              title: 'Connected',
              description: 'Real-time collaboration is now active',
            });
            break;
            
          case 'disconnected':
            setIsConnected(false);
            toast({
              variant: "destructive",
              title: 'Disconnected',
              description: 'Real-time collaboration connection lost. Trying to reconnect...',
            });
            break;
            
          case 'error':
            setLastError(data.message);
            toast({
              variant: "destructive",
              title: 'Connection Error',
              description: data.message || 'Failed to connect to real-time service',
            });
            break;
            
          default:
            break;
        }
      };
      
      // Listen for socket events
      window.addEventListener('socket:event', socketEventHandler as EventListener);
      
      return () => {
        console.log('Cleaning up socket connection...');
        window.removeEventListener('socket:event', socketEventHandler as EventListener);
        
        if (SocketService.isConnected()) {
          SocketService.disconnect();
        }
        
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      setIsConnected(false);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [currentUser]);

  const sendMessage = (message: any) => {
    if (!SocketService.isConnected()) {
      console.warn('Socket is not connected, message not sent', message);
      return;
    }
    
    try {
      SocketService.emit('message', message);
    } catch (error) {
      console.error('Failed to send message:', error);
      setLastError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const value = {
    socket: SocketService,
    isConnected,
    sendMessage,
    lastError
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
