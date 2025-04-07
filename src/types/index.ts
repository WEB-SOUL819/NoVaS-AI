
// User Profile Type
export interface UserProfile {
  id?: string;
  name: string;
  preferredVoice: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isProcessing?: boolean;
}

// Conversation/Chat History
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// System Status
export interface SystemStatus {
  isOnline: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  lastUpdated: Date;
  activeModules: Module[];
  batteryLevel?: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

// Module Status
export interface Module {
  id: string;
  name: string;
  isActive: boolean;
  status: 'operational' | 'limited' | 'offline' | 'error';
  description: string;
}

// Voice Command
export interface VoiceCommand {
  text: string;
  confidence: number;
  timestamp: Date;
}

// AI Response
export interface AIResponse {
  text: string;
  tokens: number;
  processingTime: number;
}

// System Modes
export type SystemMode = 'normal' | 'focus' | 'stealth' | 'travel' | 'combat';

// Animation State for UI
export interface AnimationState {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  systemPulse: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth related types
export interface AuthState {
  user: any | null;
  session: any | null;
  isLoading: boolean;
}
