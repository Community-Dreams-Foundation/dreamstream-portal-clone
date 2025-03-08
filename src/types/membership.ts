
export type MembershipTier = 'basic' | 'premium' | 'enterprise';

export interface MembershipPlan {
  id: string;
  name: string;
  tier: MembershipTier;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
}

export interface UserMembership {
  userId: string;
  planId: string;
  status: 'active' | 'suspended' | 'cancelled';
  startDate: string;
  endDate: string;
  lastPaymentDate: string;
  autoRenew: boolean;
}
