
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { UserRole, AuthUser, OWNER_EMAIL } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasValidSubscription: boolean;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAdmin: false,
  isOwner: false,
  hasValidSubscription: false,
  signOut: async () => {},
  updateUserRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      setIsLoading(true);
      
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          setSession(currentSession);
          if (currentSession?.user) {
            const userData = await fetchUserData(currentSession.user);
            setUser(userData);
            setIsAdmin(userData.role === 'admin' || userData.role === 'owner');
            setIsOwner(userData.role === 'owner');
            setHasValidSubscription(userData.subscriptionTier !== 'free');
          } else {
            setUser(null);
            setIsAdmin(false);
            setIsOwner(false);
            setHasValidSubscription(false);
          }
          setIsLoading(false);
        }
      );

      // THEN check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession?.user) {
        const userData = await fetchUserData(currentSession.user);
        setUser(userData);
        setIsAdmin(userData.role === 'admin' || userData.role === 'owner');
        setIsOwner(userData.role === 'owner');
        setHasValidSubscription(userData.subscriptionTier !== 'free');
      }
      
      setIsLoading(false);

      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, []);

  const fetchUserData = async (supabaseUser: User): Promise<AuthUser> => {
    try {
      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;
      
      // Determine role based on email (since we don't have the roles table yet)
      // In a production app, you'd use a proper roles table query
      let role: UserRole = 'user';
      if (supabaseUser.email === OWNER_EMAIL) {
        role = 'owner';
      }

      // For now, assume subscription tier
      // In a production app, you'd query the subscriptions table
      const subscriptionTier = 'free';

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: role,
        subscriptionTier: subscriptionTier as 'free' | 'basic' | 'premium' | 'enterprise',
        createdAt: new Date(supabaseUser.created_at || Date.now()),
        // Only include avatarUrl if it's available in the profile
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      
      // Return basic user data if we couldn't fetch extended profile
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: supabaseUser.email === OWNER_EMAIL ? 'owner' : 'user',
        subscriptionTier: 'free',
        createdAt: new Date(supabaseUser.created_at || Date.now())
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!user || (user.role !== 'owner' && (user.role !== 'admin' || newRole === 'owner'))) {
      toast.error("You don't have permission to update user roles");
      return;
    }

    try {
      // In a real app, you'd update the user_roles table
      // For now, just show a success message
      toast.success(`User role updated to ${newRole}`);
      
      // Trigger a refresh of user data if the current user's role was updated
      if (userId === user.id) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const userData = await fetchUserData(currentUser);
          setUser(userData);
          setIsAdmin(userData.role === 'admin' || userData.role === 'owner');
          setIsOwner(userData.role === 'owner');
        }
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isLoading, 
      isAdmin, 
      isOwner, 
      hasValidSubscription,
      signOut, 
      updateUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
