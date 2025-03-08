import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getIdTokenResult,
  AuthError,
  sendEmailVerification,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, checkFirebaseConnection } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { createUserDocument, logAuditEvent } from '@/utils/authUtils';
import type { UserRole } from '@/types/auth';

export const useAuthOperations = () => {
  const signup = async (email: string, password: string) => {
    try {
      console.log('Starting signup operation...');
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw new Error('Firebase is offline. Please check your internet connection.');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', result.user.uid);
      
      // Send email verification
      await sendEmailVerification(result.user);
      console.log('Verification email sent');
      
      await createUserDocument(result.user.uid, email);
      console.log('User document created in Firestore');
      
      toast({ 
        title: "Account created successfully", 
        description: "Please check your email to verify your account." 
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.code ? `Error (${error.code}): ${error.message}` : error.message;
      toast({ 
        variant: "destructive", 
        title: "Error creating account", 
        description: errorMessage
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login operation for:', email);
      
      // Skip Firebase connection check for now as it might be causing issues
      console.log('Attempting authentication directly...');
      let result;
      try {
        result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Firebase login successful for:', result.user.email);
        
        // For test account, skip email verification check
        if (email !== 'testuser@admin.com' && !result.user.emailVerified) {
          toast({
            variant: "destructive",
            title: "Email not verified",
            description: "Please verify your email before logging in."
          });
          await signOut(auth);
          throw new Error('Email not verified');
        }
      } catch (authError: any) {
        console.error('Firebase authentication error:', authError);
        throw authError;
      }
      
      console.log('Fetching user document...');
      
      // For test account, skip Firestore check
      if (email === 'testuser@admin.com') {
        console.log('Using test account - bypassing Firestore check');
        return 'member' as UserRole;
      }
      
      // Guard against Firestore errors
      try {
        // Validate db is properly initialized
        if (!db) {
          console.error('Firestore DB is not initialized');
          // Return a default role instead of failing
          toast({
            variant: "warning", 
            title: "Limited functionality", 
            description: "Using basic access due to database connection issues"
          });
          return 'member' as UserRole;
        }
        
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        console.log('User document exists:', userDoc.exists());
        
        let role: UserRole;
        
        if (!userDoc.exists()) {
          console.log('Creating user document for new user');
          try {
            await createUserDocument(result.user.uid, email);
            role = 'member';
          } catch (createDocError) {
            console.error('Error creating user document:', createDocError);
            // Don't fail the login, just use a default role
            role = 'member';
          }
        } else {
          const userData = userDoc.data();
          role = userData?.role as UserRole || 'member';
          console.log('User role from document:', role);
        }
        
        if (role === 'super_admin') {
          try {
            await logAuditEvent(result.user.uid, 'super_admin_login', { email });
          } catch (auditError) {
            console.error('Failed to log audit event:', auditError);
          }
        }

        console.log('Login successful, returning role:', role);
        toast({ title: "Logged in successfully", description: "Welcome back!" });
        return role;
      } catch (firestoreError) {
        console.error('Firestore operation failed:', firestoreError);
        // Don't fail the login, use a default role
        toast({
          variant: "warning", 
          title: "Limited functionality", 
          description: "Using basic access due to database connection issues"
        });
        return 'member' as UserRole;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred during login.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code) {
        errorMessage = `Authentication error (${error.code}): ${error.message}`;
      }
      
      toast({ 
        variant: "destructive", 
        title: "Login failed", 
        description: errorMessage
      });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: "Verification email sent",
          description: "Please check your inbox"
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error sending verification email",
          description: error.message
        });
      }
    }
  };

  const setupMFA = async (phoneNumber: string) => {
    if (!auth.currentUser) {
      throw new Error('User must be logged in to setup MFA');
    }

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });

      const multiFactorSession = await multiFactor(auth.currentUser).getSession();
      
      const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
      
      toast({
        title: "Verification code sent",
        description: "Please enter the code sent to your phone"
      });
      
      return verificationId;
    } catch (error: any) {
      console.error('MFA setup error:', error);
      toast({
        variant: "destructive",
        title: "MFA setup failed",
        description: error.message
      });
      throw error;
    }
  };

  const completeMFASetup = async (verificationId: string, verificationCode: string) => {
    if (!auth.currentUser) {
      throw new Error('User must be logged in to complete MFA setup');
    }

    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      
      await multiFactor(auth.currentUser).enroll(multiFactorAssertion, "Phone number for 2FA");
      
      // Update user document to reflect MFA status
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        mfaEnabled: true
      });

      toast({
        title: "MFA setup complete",
        description: "Two-factor authentication has been enabled for your account"
      });
    } catch (error: any) {
      console.error('MFA completion error:', error);
      toast({
        variant: "destructive",
        title: "MFA setup failed",
        description: error.message
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log('Google login success:', result.user.email);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await createUserDocument(result.user.uid, result.user.email);
        return 'member' as UserRole;
      } else {
        const userData = userDoc.data();
        const role = userData.role as UserRole;
        
        if (role === 'super_admin') {
          await logAuditEvent(result.user.uid, 'super_admin_google_login', { email: result.user.email });
        }
        
        return role;
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({ variant: "destructive", title: "Google login failed", description: error.message });
      throw error;
    }
  };

  const handleLogout = async (userId: string, userRole: UserRole | undefined) => {
    try {
      if (userRole === 'super_admin') {
        await logAuditEvent(userId, 'super_admin_logout', { });
      }
      
      await signOut(auth);
      localStorage.removeItem('authToken');
      toast({ title: "Logged out successfully" });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({ variant: "destructive", title: "Logout failed", description: error.message });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password reset email sent", description: "Check your email for further instructions" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Password reset failed", description: error.message });
      throw error;
    }
  };

  return {
    signup,
    login,
    signInWithGoogle,
    handleLogout,
    resetPassword,
    resendVerificationEmail,
    setupMFA,
    completeMFASetup
  };
};
