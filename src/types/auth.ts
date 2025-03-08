
import { User } from 'firebase/auth';

export type UserRole = 'member' | 'admin' | 'super_admin';

export interface AuditLog {
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: number;
}

export interface CustomClaims {
  role?: UserRole;
  mfaEnabled?: boolean;
  emailVerified?: boolean;
}

export interface ExtendedUser extends User {
  role?: UserRole;
  mfaEnabled?: boolean;
}

export interface MFASetupData {
  qrCodeUrl: string;
  secret: string;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  location?: {
    city?: string;
    country?: string;
    ip: string;
  };
  lastActive: number;
  createdAt: number;
  isCurrentSession: boolean;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'password_change' | 'profile_update' | 'mfa_enabled' | 'mfa_disabled' | 'email_change' | 'login_failed';
  timestamp: number;
  ipAddress: string;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  metadata?: Record<string, any>;
}

export interface AccountSecuritySettings {
  mfaEnabled: boolean;
  recoveryEmail?: string;
  sessionTimeout?: number; // in minutes
  lastPasswordChange?: number;
  passwordExpiryDays?: number;
  loginNotifications: boolean;
}

export interface UserDataExport {
  profile: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    createdAt: number;
    lastLogin?: number;
  };
  securitySettings: AccountSecuritySettings;
  activityLog: ActivityLogEntry[];
  sessions: Session[];
}
