
import { AI_CONFIG, API_KEYS, SYSTEM_PROMPTS, SYSTEM_CONFIG } from "@/config/env";
import { AIResponse, Message } from "@/types";
import { searchWikipedia, isWikipediaQuery, extractWikipediaSearchTerm } from "./wikipedia";
import { evalMathExpression } from "./mathUtils";
import { sqliteCache } from "./sqliteCache";
import { formatMessagesForGemini, estimateTokenCount, generateConversationCacheKey } from "./aiUtils";

/**
 * Processes a message through the Gemini AI API
 */
export async function processWithAI(
  messages: Message[],
  systemPrompt: string = SYSTEM_PROMPTS.DEFAULT
): Promise<AIResponse> {
  try {
    const startTime = Date.now();

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || '';
    const lastMessageLower = lastMessage.toLowerCase();
    
    // Handle introduction requests
    if (lastMessageLower.includes('who are you') || 
        lastMessageLower.includes('introduce yourself') || 
        lastMessageLower.includes('tell me about yourself') ||
        lastMessageLower.includes('what is your name')) {
      const introText = `I am ${SYSTEM_CONFIG.ASSISTANT_NAME}, an advanced AI assistant. I'm designed to assist with various tasks including information retrieval, knowledge processing, and voice interactions. How can I help you today?`;
      
      return {
        text: introText,
        tokens: estimateTokenCount(introText),
        processingTime: Date.now() - startTime,
        fromCache: false
      };
    }
    
    // Handle time/date requests locally
    if (lastMessageLower.includes('time') || lastMessageLower.includes('date') || lastMessageLower.includes('day')) {
      const now = new Date();
      let responseText = '';
      
      if (lastMessageLower.includes('time')) {
        responseText = `The current time is ${now.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit', hour12: true})}.`;
      } else if (lastMessageLower.includes('date') || lastMessageLower.includes('day')) {
        responseText = `Today is ${now.toLocaleDateString()} (${now.toLocaleString('en-US', { weekday: 'long' })}).`;
      }
      
      return {
        text: responseText,
        tokens: estimateTokenCount(responseText),
        processingTime: Date.now() - startTime,
        fromCache: false
      };
    }
    
    // Handle mathematical expressions
    const mathResult = evalMathExpression(lastMessage);
    if (mathResult !== null) {
      const responseText = `The result of ${lastMessage} is ${mathResult}.`;
      return {
        text: responseText,
        tokens: estimateTokenCount(responseText),
        processingTime: Date.now() - startTime,
        fromCache: false
      };
    }
    
    // Check for Wikipedia-like knowledge queries
    if (isWikipediaQuery(lastMessage)) {
      console.log("Detected Wikipedia query:", lastMessage);
      const searchTerm = extractWikipediaSearchTerm(lastMessage);
      
      if (searchTerm) {
        console.log("Extracted Wikipedia search term:", searchTerm);
        
        // Try to get from cache first
        const cacheKey = `wikipedia:${searchTerm}`;
        const cachedResult = await sqliteCache.get<string>(cacheKey);
        
        if (cachedResult) {
          return {
            text: cachedResult,
            tokens: estimateTokenCount(cachedResult),
            processingTime: Date.now() - startTime,
            fromCache: true
          };
        }
        
        // If not in cache, fetch from Wikipedia
        const wikipediaResult = await searchWikipedia(searchTerm);
        
        // Cache the result (24 hour TTL for Wikipedia data)
        await sqliteCache.set(cacheKey, wikipediaResult, 24 * 60 * 60 * 1000);
        
        return {
          text: wikipediaResult,
          tokens: estimateTokenCount(wikipediaResult),
          processingTime: Date.now() - startTime,
          fromCache: false
        };
      }
    }

    // Generate a cache key based on the conversation
    const conversationKey = generateConversationCacheKey(messages, systemPrompt);
    
    // Check if we have a cached response
    const cachedResult = await sqliteCache.get<string>(conversationKey);
    if (cachedResult) {
      return {
        text: cachedResult,
        tokens: estimateTokenCount(cachedResult),
        processingTime: Date.now() - startTime,
        fromCache: true
      };
    }

    // Format messages for the API
    const formattedMessages = formatMessagesForGemini(messages, systemPrompt);
    
    try {
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

      // Cache the response (10 minute TTL for API responses)
      await sqliteCache.set(conversationKey, aiText, 10 * 60 * 1000);

      return {
        text: aiText,
        tokens,
        processingTime,
        fromCache: false
      };
    } catch (error) {
      console.error("Error calling AI API:", error);
      // Handle common queries with fallback responses when API fails
      if (lastMessageLower.includes('hello') || lastMessageLower.includes('hi')) {
        return {
          text: "Hello! How can I assist you today?",
          tokens: 8,
          processingTime: Date.now() - startTime,
          fromCache: false
        };
      }
      
      return {
        text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Is there something simple I can help you with?",
        tokens: 20,
        processingTime: Date.now() - startTime,
        fromCache: false
      };
    }
  } catch (error) {
    console.error("Error processing with AI:", error);
    return {
      text: "I'm sorry, I encountered an error while processing your request.",
      tokens: 0,
      processingTime: 0,
      fromCache: false
    };
  }
}
