
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToDocument, subscribeToRealTimeDB } from '@/lib/firebase';
import { useSocket } from '@/contexts/SocketContext';
import { Task } from '@/types/task';
import { toast } from '@/components/ui/use-toast';

interface CollaborationUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  lastActive: number;
  currentTask?: string;
  online: boolean;
}

export function useRealTimeCollaboration() {
  const { currentUser } = useAuth();
  const { socket, isConnected, sendMessage } = useSocket();
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [taskEditors, setTaskEditors] = useState<Record<string, string[]>>({});
  
  // Update user presence
  useEffect(() => {
    if (!currentUser) return;
    
    // Update user's online status and last active timestamp in RTDB
    const updatePresence = () => {
      const presencePath = `presence/${currentUser.uid}`;
      try {
        const presenceData = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
          lastActive: Date.now(),
          online: true
        };
        
        // Use socketService for presence update
        if (isConnected) {
          sendMessage({
            type: 'presence:update',
            payload: presenceData
          });
        }
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };
    
    // Set initial presence
    updatePresence();
    
    // Set up interval for regular presence updates
    const interval = setInterval(updatePresence, 30000); // Every 30 seconds
    
    // Subscribe to active users
    const unsubscribe = subscribeToRealTimeDB('presence', (data) => {
      if (!data) return;
      
      const users = Object.values(data) as CollaborationUser[];
      // Filter out users who haven't been active in the last 5 minutes
      const recentlyActiveUsers = users.filter(user => 
        user.lastActive > Date.now() - 5 * 60 * 1000
      );
      
      setActiveUsers(recentlyActiveUsers);
    });
    
    // Set up socket for real-time updates
    if (isConnected && socket) {
      socket.on('task:editing', (data: { taskId: string, userId: string, userName: string, action: 'start' | 'end' }) => {
        setTaskEditors(prev => {
          const newEditors = { ...prev };
          
          if (data.action === 'start') {
            // Add user to editors if not already there
            if (!newEditors[data.taskId]) {
              newEditors[data.taskId] = [];
            }
            if (!newEditors[data.taskId].includes(data.userId)) {
              newEditors[data.taskId] = [...newEditors[data.taskId], data.userId];
              
              // Show toast if someone else starts editing
              if (data.userId !== currentUser.uid) {
                toast({
                  title: 'Collaboration',
                  description: `${data.userName || 'Someone'} is now editing task ${data.taskId}`,
                });
              }
            }
          } else if (data.action === 'end') {
            // Remove user from editors
            if (newEditors[data.taskId]) {
              newEditors[data.taskId] = newEditors[data.taskId].filter(uid => uid !== data.userId);
              if (newEditors[data.taskId].length === 0) {
                delete newEditors[data.taskId];
              }
            }
          }
          
          return newEditors;
        });
      });
      
      socket.on('task:updated', (data: { taskId: string, userId: string, userName: string }) => {
        if (data.userId !== currentUser.uid) {
          toast({
            title: 'Task Updated',
            description: `${data.userName || 'Someone'} updated task ${data.taskId}`,
          });
        }
      });
    }
    
    // Clean up
    return () => {
      clearInterval(interval);
      unsubscribe();
      
      if (isConnected && socket) {
        socket.off('task:editing');
        socket.off('task:updated');
      }
      
      // Set offline status on unmount
      if (isConnected) {
        sendMessage({
          type: 'presence:update',
          payload: {
            uid: currentUser.uid,
            online: false,
            lastActive: Date.now()
          }
        });
      }
    };
  }, [currentUser, isConnected, socket, sendMessage]);
  
  // Start editing a task
  const startEditingTask = useCallback((taskId: string) => {
    if (!currentUser || !isConnected) return;
    
    sendMessage({
      type: 'task:editing',
      payload: {
        taskId,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        action: 'start'
      }
    });
  }, [currentUser, isConnected, sendMessage]);
  
  // Stop editing a task
  const stopEditingTask = useCallback((taskId: string) => {
    if (!currentUser || !isConnected) return;
    
    sendMessage({
      type: 'task:editing',
      payload: {
        taskId,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        action: 'end'
      }
    });
  }, [currentUser, isConnected, sendMessage]);
  
  // Notify others about task update
  const notifyTaskUpdated = useCallback((taskId: string) => {
    if (!currentUser || !isConnected) return;
    
    sendMessage({
      type: 'task:updated',
      payload: {
        taskId,
        userId: currentUser.uid,
        userName: currentUser.displayName
      }
    });
  }, [currentUser, isConnected, sendMessage]);
  
  // Check if a task is being edited by others
  const isTaskBeingEditedByOthers = useCallback((taskId: string): boolean => {
    if (!taskId || !currentUser || !taskEditors[taskId]) return false;
    
    // Check if any editors other than current user
    return taskEditors[taskId].some(uid => uid !== currentUser.uid);
  }, [currentUser, taskEditors]);
  
  // Get editor names for a task
  const getTaskEditors = useCallback((taskId: string): string[] => {
    if (!taskId || !taskEditors[taskId]) return [];
    
    return activeUsers
      .filter(user => taskEditors[taskId].includes(user.uid))
      .map(user => user.displayName || user.email || 'Anonymous user');
  }, [activeUsers, taskEditors]);
  
  return {
    activeUsers,
    taskEditors,
    startEditingTask,
    stopEditingTask,
    notifyTaskUpdated,
    isTaskBeingEditedByOthers,
    getTaskEditors
  };
}
