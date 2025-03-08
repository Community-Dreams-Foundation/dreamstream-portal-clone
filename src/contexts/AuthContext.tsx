import { createContext, useContext, useEffect, useState } from 'react';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { checkRole, logAuditEvent } from '@/utils/authUtils';
import { useFirebaseToken } from '@/hooks/useFirebaseToken';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { AccountApi } from '@/api/gateway';
import type { UserRole, ExtendedUser, Session, ActivityLogEntry } from '@/types/auth';
import type { AuthContextType } from '@/types/authContext';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>();
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { 
    signup, 
    login, 
    signInWithGoogle, 
    handleLogout, 
    resetPassword,
    resendVerificationEmail,
    setupMFA,
    completeMFASetup 
  } = useAuthOperations();

  useEffect(() => {
    console.log('Setting up Firebase persistence...');
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error);
        toast({ 
          variant: "destructive", 
          title: "Authentication Error", 
          description: "Failed to enable persistent login" 
        });
      });
  }, []);

  useFirebaseToken(setCurrentUser, setUserRole);
  useFirebaseAuth(setCurrentUser, setUserRole, setLoading);

  const getActiveSessions = async (): Promise<Session[]> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    try {
      return await AccountApi.fetchSessions(currentUser.uid);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      toast({
        variant: "destructive",
        title: "Error fetching sessions",
        description: "Could not retrieve your active sessions"
      });
      return [];
    }
  };

  const terminateSession = async (sessionId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    try {
      await AccountApi.terminateSession(sessionId);
      toast({
        title: "Session terminated",
        description: "The selected session has been logged out"
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        variant: "destructive",
        title: "Error terminating session",
        description: "Could not terminate the selected session"
      });
      throw error;
    }
  };

  const terminateAllSessions = async (excludeCurrentSession: boolean = true): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    try {
      await AccountApi.terminateAllSessions(excludeCurrentSession);
      toast({
        title: "All sessions terminated",
        description: excludeCurrentSession 
          ? "All other sessions have been logged out" 
          : "All sessions including current have been logged out"
      });
      
      if (!excludeCurrentSession) {
        await handleLogout(currentUser.uid, userRole);
        setUserRole(undefined);
      }
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      toast({
        variant: "destructive",
        title: "Error terminating sessions",
        description: "Could not terminate all sessions"
      });
      throw error;
    }
  };

  const getAccountActivity = async (limit: number = 20): Promise<ActivityLogEntry[]> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    try {
      return await AccountApi.fetchActivityLog(currentUser.uid, limit);
    } catch (error) {
      console.error('Error fetching account activity:', error);
      toast({
        variant: "destructive",
        title: "Error fetching activity",
        description: "Could not retrieve your account activity"
      });
      return [];
    }
  };

  const exportUserData = async (): Promise<Blob> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    try {
      const userData = await AccountApi.exportUserData(currentUser.uid);
      const jsonString = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      toast({
        title: "Data export ready",
        description: "Your data has been prepared for download"
      });
      
      return blob;
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast({
        variant: "destructive",
        title: "Error exporting data",
        description: "Could not export your personal data"
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    login: async (email: string, password: string) => {
      console.log('AuthContext: Starting login process');
      try {
        const role = await login(email, password);
        console.log('AuthContext: Setting user role:', role);
        setUserRole(role);
        setIsNewUser(false);
        return role;
      } catch (error) {
        console.error('AuthContext: Login failed', error);
        throw error;
      }
    },
    signup: async (email: string, password: string) => {
      console.log('AuthContext: Starting signup process');
      await signup(email, password);
      setIsNewUser(true);
    },
    logout: async () => {
      console.log('AuthContext: Starting logout process');
      if (currentUser) {
        await handleLogout(currentUser.uid, userRole);
        setUserRole(undefined);
      }
    },
    resetPassword,
    signInWithGoogle: async () => {
      console.log('AuthContext: Starting Google sign-in process');
      const role = await signInWithGoogle();
      setUserRole(role);
      setIsNewUser(!role);
      toast({ title: "Logged in successfully", description: "Welcome to DreamStream!" });
    },
    loading,
    isNewUser,
    logAuditEvent: async (action: string, details: Record<string, any>) => {
      if (currentUser) {
        await logAuditEvent(currentUser.uid, action, details);
      }
    },
    resendVerificationEmail,
    setupMFA,
    completeMFASetup,
    getActiveSessions,
    terminateSession,
    terminateAllSessions,
    getAccountActivity,
    exportUserData,
    ...checkRole(userRole)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
