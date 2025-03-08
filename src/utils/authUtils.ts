
import { User } from 'firebase/auth';
import { doc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import type { AuditLog, UserRole } from '@/types/auth';

export const createUserDocument = async (uid: string, email: string | null) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      email,
      role: 'member',
      createdAt: Date.now()
    });
  } catch (error: any) {
    console.error('Error creating user document:', error);
    toast({ 
      variant: "destructive", 
      title: "Error", 
      description: "Failed to create user profile" 
    });
    throw error;
  }
};

export const logAuditEvent = async (userId: string, action: string, details: Record<string, any>) => {
  try {
    const auditLog: AuditLog = {
      userId,
      action,
      details,
      timestamp: Date.now()
    };

    await addDoc(collection(db, 'audit_logs'), auditLog);
    console.log('Audit log created:', action);
  } catch (error) {
    console.error('Error creating audit log:', error);
    toast({
      variant: "destructive",
      title: "Audit Log Error",
      description: "Failed to log admin action"
    });
    throw error;
  }
};

export const checkRole = (role: UserRole | undefined) => ({
  isSuperAdmin: () => role === 'super_admin',
  isAdmin: () => role === 'admin' || role === 'super_admin'
});

