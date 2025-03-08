
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, ExtendedUser } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

export const useFirebaseAuth = (
  setCurrentUser: (user: ExtendedUser | null) => void,
  setUserRole: (role: UserRole | undefined) => void,
  setLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed. User:', user?.email);
      
      if (!mounted) {
        console.log('Component unmounted, skipping state updates');
        return;
      }

      try {
        if (user) {
          console.log('Starting Firestore fetch for user:', user.uid);
          let userDoc;
          
          try {
            // Validate db connection first
            if (!db) {
              throw new Error('Firestore instance is not initialized');
            }

            // Try to get the user document reference
            const userRef = doc(db, 'users', user.uid);
            if (!userRef) {
              throw new Error('Failed to create document reference');
            }

            // Attempt to fetch the document
            userDoc = await getDoc(userRef);
            console.log('Firestore fetch result:', {
              exists: userDoc.exists(),
              id: userDoc.id,
              path: userDoc.ref.path
            });
          } catch (firestoreError: any) {
            console.error('Detailed Firestore error:', {
              code: firestoreError.code,
              message: firestoreError.message,
              stack: firestoreError.stack
            });
            throw new Error(`Failed to fetch user data: ${firestoreError.message}`);
          }
          
          if (!userDoc.exists()) {
            console.warn('User document missing for uid:', user.uid);
            const role: UserRole = 'member';
            const extendedUser = Object.assign({}, user, { role });
            setCurrentUser(extendedUser);
            setUserRole(role);
          } else {
            const userData = userDoc.data();
            console.log('User document data:', userData);
            const role = userData?.role as UserRole;
            console.log('User role from Firestore:', role);
            const extendedUser = Object.assign({}, user, { role });
            setCurrentUser(extendedUser);
            setUserRole(role);
          }
        } else {
          console.log('No user found, clearing state');
          setCurrentUser(null);
          setUserRole(undefined);
        }
      } catch (error: any) {
        console.error('Detailed auth error:', {
          name: error.name,
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        const errorMessage = error.code 
          ? `Authentication error (${error.code}): ${error.message}`
          : error.message || 'Failed to load user data';
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorMessage
        });
        setCurrentUser(null);
        setUserRole(undefined);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up Firebase auth listener');
      mounted = false;
      unsubscribe();
    };
  }, [setCurrentUser, setUserRole, setLoading]);
};
