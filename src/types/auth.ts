
export type UserRole = 'user' | 'admin' | 'owner';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface AuthState {
  user: AuthUser | null;
  session: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasValidSubscription: boolean;
}

export const OWNER_EMAIL = 'fortwoyears172@gmail.com';
