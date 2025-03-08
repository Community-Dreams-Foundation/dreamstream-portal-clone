
import { useEffect, useRef, useCallback } from 'react';
import { getIdToken, getIdTokenResult } from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import type { UserRole, ExtendedUser } from '@/types/auth';

export const useFirebaseToken = (
  setCurrentUser: (user: ExtendedUser | null) => void,
  setUserRole: (role: UserRole | undefined) => void
) => {
  const isMounted = useRef(true);
  
  // Memoize the token handling logic to prevent unnecessary work
  const handleTokenChange = useCallback(async (user: any) => {
    console.log('Token changed:', user?.email);
    try {
      if (user && isMounted.current) {
        try {
          // Batch token operations to reduce potential race conditions
          const [token, tokenResult] = await Promise.all([
            getIdToken(user, true),
            getIdTokenResult(user)
          ]);
          
          const role = tokenResult.claims.role as UserRole;
          
          localStorage.setItem('authToken', token);
          if (isMounted.current) {
            // Create extended user object with role for consistent state
            const extendedUser: ExtendedUser = Object.assign({}, user, { role });
            setUserRole(role);
            setCurrentUser(extendedUser);
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          if (isMounted.current) {
            toast({
              variant: "destructive",
              title: "Session Error",
              description: "Failed to refresh authentication token"
            });
          }
        }
      } else if (isMounted.current) {
        console.log('No authenticated user, clearing state');
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setUserRole(undefined);
      }
    } catch (error) {
      console.error('Firebase token processing error:', error);
      if (isMounted.current) {
        setCurrentUser(null);
        setUserRole(undefined);
      }
    }
  }, [setCurrentUser, setUserRole]);

  useEffect(() => {
    console.log('Setting up Firebase token listener');
    isMounted.current = true;

    const unsubscribe = auth.onIdTokenChanged(handleTokenChange);

    return () => {
      console.log('Cleaning up Firebase token listener');
      isMounted.current = false;
      unsubscribe();
    };
  }, [handleTokenChange]);
};
