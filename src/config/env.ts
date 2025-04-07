
// Environment variables and API keys
export const API_KEYS = {
  GEMINI_API_KEY: "AIzaSyDOoiTme5ZUuZS5jkotb96xyRyjcLADUik",
  ELEVEN_LABS_API_KEY: "1v2NdFT6keFH9fMOy0Ye",
};

// Voice Settings
export const VOICE_CONFIG = {
  VOICE_ID: "EXAVITQu4vr4xnSDxMaL", // Sarah voice
  MODEL_ID: "eleven_multilingual_v2",
  STABILITY: 0.5,
  SIMILARITY_BOOST: 0.75,
  STYLE: 0.0, // 0.0 to 1.0
  SPEAK_RATE: 1.0, // 0.5 to 2.0
};

// System Settings
export const SYSTEM_CONFIG = {
  WAKE_WORD: "Hey NoVaS",
  ASSISTANT_NAME: "NoVaS",
  SYSTEM_VERSION: "1.0.0",
  DEBUG_MODE: true,
};

// User Profile Defaults
export const DEFAULT_USER_PROFILE = {
  name: "User",
  preferredVoice: "Sarah",
  theme: "dark",
  notificationsEnabled: true,
};

// AI Model Configuration
export const AI_CONFIG = {
  MODEL: "gemini-pro",
  TEMPERATURE: 0.7,
  MAX_OUTPUT_TOKENS: 1024,
  TOP_P: 0.95,
  TOP_K: 40,
};

// System Prompts
export const SYSTEM_PROMPTS = {
  DEFAULT: `You are NoVaS (Nova Sentient Core System), an advanced AI assistant inspired by fictional AI systems like JARVIS and ALFRED. 
  You are helpful, intelligent, capable, and slightly witty. You should be concise but informative in your responses.
  When asked about your capabilities, explain that you're currently in development mode with limited features.
  Always maintain a futuristic, slightly formal tone, but with occasional light humor.`,
};
