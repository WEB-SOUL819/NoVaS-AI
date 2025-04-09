
import { AuthUser } from "@/types/auth";

/**
 * Returns appropriate greeting for the user based on their role
 */
export const getUserGreeting = (user: AuthUser | null): string => {
  if (!user) return "Welcome, Guest";
  
  if (user.role === 'owner') {
    return `Welcome, Sir`;
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

/**
 * Checks if current time falls within certain hours for time-based greetings
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

/**
 * Get current date and time as a formatted string
 */
export const getCurrentDateTime = (): string => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
