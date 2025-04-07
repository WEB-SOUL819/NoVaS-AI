
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { UserRole } from "@/types/roles";
import { toast } from "sonner";

interface DevModeContextType {
  isDevMode: boolean;
  toggleDevMode: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const DevModeContext = createContext<DevModeContextType>({
  isDevMode: false,
  toggleDevMode: () => {},
  userRole: 'user',
  setUserRole: () => {},
});

export const useDevMode = () => useContext(DevModeContext);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDevMode, setIsDevMode] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');

  // Check local storage for dev mode state on init
  useEffect(() => {
    const storedDevMode = localStorage.getItem('novas_dev_mode');
    const storedRole = localStorage.getItem('novas_user_role') as UserRole | null;
    
    if (storedDevMode === 'true') {
      setIsDevMode(true);
    }
    
    if (storedRole && ['user', 'admin', 'owner'].includes(storedRole)) {
      setUserRole(storedRole as UserRole);
    }
  }, []);
  
  // Save dev mode state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('novas_dev_mode', isDevMode.toString());
  }, [isDevMode]);
  
  // Save user role to local storage when it changes
  useEffect(() => {
    localStorage.setItem('novas_user_role', userRole);
  }, [userRole]);

  const toggleDevMode = () => {
    const newDevMode = !isDevMode;
    setIsDevMode(newDevMode);
    
    if (newDevMode) {
      toast.success("Developer Mode Activated", {
        description: "Advanced features are now available."
      });
    } else {
      toast.info("Developer Mode Deactivated", {
        description: "Returned to standard mode."
      });
    }
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, toggleDevMode, userRole, setUserRole }}>
      {children}
    </DevModeContext.Provider>
  );
};
