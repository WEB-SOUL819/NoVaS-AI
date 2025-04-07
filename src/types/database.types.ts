
// This file provides TypeScript interfaces for our Supabase database tables
// These types help with type safety when working with Supabase queries

// User Profiles Table
export interface DbUserProfile {
  id: string;
  name: string;
  preferred_voice: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Conversations Table
export interface DbConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Messages Table
export interface DbMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: string;
}

// System Status Table
export interface DbSystemStatus {
  id: string;
  is_online: boolean;
  last_updated: string;
}

// Modules Table
export interface DbModule {
  id: string;
  name: string;
  is_active: boolean;
  status: 'operational' | 'limited' | 'offline' | 'error';
  description: string;
}
