
import { AuthUser } from "@/types/auth";

/**
 * Returns appropriate greeting for the user based on their role
 */
export const getUserGreeting = (user: AuthUser | null): string => {
  if (!user) return "Welcome, Guest";
  
  if (user.role === 'owner') {
    return `Welcome, Sir ${user.name || ''}`;
  } else if (user.role === 'admin') {
    return `Welcome, Admin ${user.name || ''}`;
  } else {
    return `Welcome, ${user.name || 'User'}`;
  }
};

/**
 * Returns appropriate title/prefix for the user based on their role
 */
export const getUserTitle = (user: AuthUser | null): string => {
  if (!user) return "";
  
  if (user.role === 'owner') {
    return "Sir";
  } else if (user.role === 'admin') {
    return "Admin";
  }
  return "";
};
