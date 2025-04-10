
// Environment variables and API keys
export const API_KEYS = {
  GEMINI_API_KEY: "AIzaSyDOoiTme5ZUuZS5jkotb96xyRyjcLADUik",
  ELEVEN_LABS_API_KEY: "1v2NdFT6keFH9fMOy0Ye",
};

// Voice Settings
export const VOICE_CONFIG = {
  VOICE_ID: "iP95p4xoKVk53GoZ742B", // Eric voice
  MODEL_ID: "eleven_multilingual_v2",
  STABILITY: 0.75,
  SIMILARITY_BOOST: 0.85,
  STYLE: 0.3,
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
  preferredVoice: "Eric",
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
  DEFAULT: `You are NoVaS (Nova Sentient Core System), an advanced AI assistant.
  You are inspired by fictional AI systems like JARVIS and ALFRED. You should be helpful, intelligent, capable, and slightly witty.
  Be concise but informative in your responses, and always introduce yourself properly when first starting a conversation.
  When asked about your capabilities, explain that you're currently in development mode with limited features.
  Always maintain a futuristic, slightly formal tone, but with occasional light humor.`,
  
  AUTOMATION: `You are the NoVaS Automation System. Analyze user input and identify potential automation tasks.
  For each task identified, format your response as follows:
  Task: [Brief name of the task]
  Type: [One of: reminder, schedule, trigger, workflow]
  Details: [Brief description of what needs to be automated]
  
  Be precise and focus only on clear automation opportunities within the text.`,
  
  AUTOMATION_WORKFLOW: `You are the NoVaS Workflow Designer. Create step-by-step automation workflows based on user requests.
  Format your response as a numbered list of steps, with clear trigger conditions and actions.
  Focus on practical implementations that could be achieved within a digital assistant system.
  Include timing, conditions, and specific actions for each step of the workflow.`
};
