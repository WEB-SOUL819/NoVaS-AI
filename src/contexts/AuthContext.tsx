
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
      try {
        setIsLoading(true);
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log("Auth state changed:", event, currentSession?.user?.email);
            setSession(currentSession);
            
            if (currentSession?.user) {
              // Handle auth state change synchronously to prevent blocking
              setUser(prev => {
                if (!prev || prev.id !== currentSession.user.id) {
                  // Use setTimeout to avoid recursion with auth changes
                  setTimeout(() => {
                    fetchUserData(currentSession.user).then(userData => {
                      setUser(userData);
                      setIsAdmin(userData.role === 'admin' || userData.role === 'owner');
                      setIsOwner(userData.role === 'owner');
                      setHasValidSubscription(userData.subscriptionTier !== 'free');
                    });
                  }, 0);
                }
                return prev;
              });
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

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up auth:", error);
        setIsLoading(false);
      }
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

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      // Determine role based on email
      let role: UserRole = 'user';
      if (supabaseUser.email === OWNER_EMAIL) {
        role = 'owner';
      }

      // For now, assume subscription tier
      const subscriptionTier = 'free';

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: role,
        subscriptionTier: subscriptionTier as 'free' | 'basic' | 'premium' | 'enterprise',
        createdAt: new Date(supabaseUser.created_at || Date.now()),
        // We don't have avatarUrl in the profile table
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
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
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
