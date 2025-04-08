
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

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();
        
      // For the owner email, automatically assign the owner role
      const isOwnerByEmail = supabaseUser.email === OWNER_EMAIL;
      let role: UserRole = 'user';
      
      if (isOwnerByEmail) {
        role = 'owner';
        // Ensure the owner role is set in the database
        if (!roleData || roleData.role !== 'owner') {
          await supabase
            .from('user_roles')
            .upsert({ user_id: supabaseUser.id, role: 'owner' });
        }
      } else if (roleData && !roleError) {
        role = roleData.role as UserRole;
      }

      // Fetch subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .single();

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: role,
        subscriptionTier: subscription?.tier || 'free',
        createdAt: new Date(supabaseUser.created_at || Date.now()),
        avatarUrl: profile?.avatar_url
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
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;
      toast.success(`User role updated to ${newRole}`);
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
