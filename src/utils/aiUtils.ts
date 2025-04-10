
import { Message } from "@/types";

/**
 * Generate a cache key for the conversation
 */
export function generateConversationCacheKey(messages: Message[], systemPrompt: string): string {
  // Generate a simple hash for the last few messages
  // In a production system, you'd want a more sophisticated approach
  const lastFewMessages = messages.slice(-3); // Consider last 3 messages for context
  const conversationString = JSON.stringify(lastFewMessages) + systemPrompt;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < conversationString.length; i++) {
    const char = conversationString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `conversation:${hash}`;
}

/**
 * Format messages for the Gemini API
 */
export function formatMessagesForGemini(messages: Message[], systemPrompt: string) {
  const formattedMessages = [];
  
  // Add system prompt
  formattedMessages.push({
    role: "user",
    parts: [{ text: systemPrompt }],
  });
  
  // Add response acknowledging system prompt
  formattedMessages.push({
    role: "model",
    parts: [{ text: "I understand my role as NoVaS. I'll provide helpful, intelligent, and concise responses." }],
  });
  
  // Add conversation messages
  messages.forEach(message => {
    const role = message.role === "user" ? "user" : "model";
    formattedMessages.push({
      role: role,
      parts: [{ text: message.content }],
    });
  });
  
  return formattedMessages;
}

/**
 * Rough estimate of token count (not exact)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}
