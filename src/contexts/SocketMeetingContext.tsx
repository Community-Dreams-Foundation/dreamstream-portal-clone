
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMeetings } from '@/contexts/MeetingContext';
import { useSocket, useMeetingEvents } from '@/services/socketService';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';

interface SocketMeetingContextType {
  isConnected: boolean;
}

const SocketMeetingContext = createContext<SocketMeetingContextType | undefined>(undefined);

export const SocketMeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { meetings, upcomingMeetings } = useMeetings();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  
  // Initialize socket connection
  const { isConnected } = useSocket(currentUser?.uid);
  
  // Handle meeting events
  const handleMeetingCreated = (data: any) => {
    console.log('Meeting created:', data);
    // Only notify if the current user is a participant and didn't create the meeting
    if (data.participants.some((p: any) => p.id === currentUser?.uid) && data.hostId !== currentUser?.uid) {
      toast({
        title: 'New Meeting Invitation',
        description: `You've been invited to a meeting: "${data.title}"`,
      });
      
      addNotification({
        title: `New Meeting: ${data.title}`,
        message: `You have been invited to a ${data.meetingType} meeting by ${data.hostName}`,
        type: 'meeting',
        metadata: {
          meetingId: data.id,
          priority: 'medium',
          actionRequired: true,
          action: {
            type: 'view_meeting',
            link: `/meetings/${data.id}`
          }
        }
      });
    }
  };
  
  const handleMeetingUpdated = (data: any) => {
    console.log('Meeting updated:', data);
    // Only notify if the current user is a participant and didn't update the meeting
    if (data.participants.some((p: any) => p.id === currentUser?.uid) && data.hostId !== currentUser?.uid) {
      toast({
        title: 'Meeting Updated',
        description: `A meeting has been updated: "${data.title}"`,
      });
      
      addNotification({
        title: `Meeting Update: ${data.title}`,
        message: data.status === "cancelled" 
          ? `A meeting has been cancelled by ${data.hostName}`
          : `Meeting details have been updated by ${data.hostName}`,
        type: 'meeting',
        metadata: {
          meetingId: data.id,
          priority: 'medium',
          actionRequired: true,
          action: {
            type: 'view_meeting',
            link: `/meetings/${data.id}`
          }
        }
      });
    }
  };
  
  const handleMeetingDeleted = (data: any) => {
    console.log('Meeting deleted:', data);
    // Find the meeting in our local state to get the title
    const deletedMeeting = meetings.find(m => m.id === data.meetingId);
    
    if (deletedMeeting && deletedMeeting.hostId !== currentUser?.uid) {
      toast({
        title: 'Meeting Cancelled',
        description: `A meeting has been cancelled: "${deletedMeeting.title}"`,
        variant: 'destructive'
      });
      
      addNotification({
        title: `Meeting Cancelled: ${deletedMeeting.title}`,
        message: `A meeting has been cancelled by ${deletedMeeting.hostName}`,
        type: 'meeting',
        metadata: {
          meetingId: data.meetingId,
          priority: 'medium',
          actionRequired: false
        }
      });
    }
  };
  
  const handleMeetingReminder = (data: any) => {
    console.log('Meeting reminder:', data);
    // Find the meeting in our local state
    const meeting = upcomingMeetings.find(m => m.id === data.meetingId);
    
    if (meeting) {
      toast({
        title: 'Meeting Reminder',
        description: `Your meeting "${meeting.title}" is starting soon`,
      });
      
      addNotification({
        title: `Meeting Reminder: ${meeting.title}`,
        message: `Your ${meeting.meetingType} meeting is starting in ${data.minutesUntilStart} minutes`,
        type: 'meeting',
        metadata: {
          meetingId: data.meetingId,
          priority: 'high',
          actionRequired: true,
          action: {
            type: 'join_meeting',
            link: meeting.location?.link || `/meetings/${meeting.id}`
          }
        }
      });
    }
  };
  
  const handleRecordingReady = (data: any) => {
    console.log('Recording ready:', data);
    // Find the meeting in our local state
    const meeting = meetings.find(m => m.id === data.meetingId);
    
    if (meeting) {
      toast({
        title: 'Recording Available',
        description: `Recording for "${meeting.title}" is now available`,
      });
      
      addNotification({
        title: `Recording Available: ${meeting.title}`,
        message: `The recording for your ${meeting.meetingType} meeting is now available`,
        type: 'meeting',
        metadata: {
          meetingId: data.meetingId,
          priority: 'low',
          actionRequired: false,
          action: {
            type: 'view_recording',
            link: `/meetings/recordings?id=${meeting.id}`
          }
        }
      });
    }
  };
  
  const handleTranscriptReady = (data: any) => {
    console.log('Transcript ready:', data);
    // Find the meeting in our local state
    const meeting = meetings.find(m => m.id === data.meetingId);
    
    if (meeting) {
      toast({
        title: 'Transcript Available',
        description: `Transcript for "${meeting.title}" is now available`,
      });
      
      addNotification({
        title: `Transcript Available: ${meeting.title}`,
        message: `The transcript for your ${meeting.meetingType} meeting is now available`,
        type: 'meeting',
        metadata: {
          meetingId: data.meetingId,
          priority: 'low',
          actionRequired: false,
          action: {
            type: 'view_transcript',
            link: `/meetings/recordings?id=${meeting.id}&tab=transcript`
          }
        }
      });
    }
  };
  
  // Subscribe to meeting events
  useMeetingEvents(
    handleMeetingCreated,
    handleMeetingUpdated,
    handleMeetingDeleted,
    handleMeetingReminder,
    handleRecordingReady,
    handleTranscriptReady
  );
  
  // Value to be provided by the context
  const value = {
    isConnected
  };
  
  return (
    <SocketMeetingContext.Provider value={value}>
      {children}
    </SocketMeetingContext.Provider>
  );
};

export const useSocketMeeting = () => {
  const context = useContext(SocketMeetingContext);
  if (context === undefined) {
    throw new Error('useSocketMeeting must be used within a SocketMeetingProvider');
  }
  return context;
};
