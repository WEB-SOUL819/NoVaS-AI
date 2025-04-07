
import { AI_CONFIG, API_KEYS, SYSTEM_PROMPTS } from "@/config/env";
import { AIResponse, Message } from "@/types";

/**
 * Processes a message through the Gemini AI API
 */
export async function processWithAI(
  messages: Message[],
  systemPrompt: string = SYSTEM_PROMPTS.DEFAULT
): Promise<AIResponse> {
  try {
    const startTime = Date.now();

    // Format messages for the API
    const formattedMessages = formatMessagesForGemini(messages, systemPrompt);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL}:generateContent?key=${API_KEYS.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: AI_CONFIG.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
          topP: AI_CONFIG.TOP_P,
          topK: AI_CONFIG.TOP_K,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("AI API Error:", errorData);
      throw new Error(`API error: ${response.status} ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response.";
    const tokens = estimateTokenCount(aiText);
    const processingTime = Date.now() - startTime;

    return {
      text: aiText,
      tokens,
      processingTime,
    };
  } catch (error) {
    console.error("Error processing with AI:", error);
    return {
      text: "I'm sorry, I encountered an error while processing your request.",
      tokens: 0,
      processingTime: 0,
    };
  }
}

/**
 * Format messages for the Gemini API
 */
function formatMessagesForGemini(messages: Message[], systemPrompt: string) {
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
function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}

/**
 * Extract keywords from text for context awareness
 */
export function extractKeywords(text: string): string[] {
  // Simple implementation - split on spaces and filter out common words
  const commonWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "as", "of", "is", "are", "am", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall",
    "should", "can", "could", "may", "might", "must", "i", "you", "he", "she", 
    "it", "we", "they", "this", "that", "these", "those"
  ]);
  
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 2 && !commonWords.has(word)) // Filter out common words and short words
    .slice(0, 10); // Get top 10 keywords
}
