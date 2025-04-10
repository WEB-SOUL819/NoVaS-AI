import { AI_CONFIG, API_KEYS, SYSTEM_PROMPTS, SYSTEM_CONFIG } from "@/config/env";
import { AIResponse, Message, AutomationTask } from "@/types";
import { searchWikipedia, isWikipediaQuery, extractWikipediaSearchTerm } from "./wikipedia";
import { evalMathExpression } from "./mathUtils";

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
      const introText = `I am ${SYSTEM_CONFIG.ASSISTANT_NAME}, an advanced AI assistant created by Arham Ali, Founder of Hynx Studios. I'm designed to assist with various tasks including information retrieval, knowledge processing, and voice interactions. How can I help you today?`;
      
      return {
        text: introText,
        tokens: estimateTokenCount(introText),
        processingTime: Date.now() - startTime,
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
      };
    }
    
    // Check for Wikipedia-like knowledge queries
    if (isWikipediaQuery(lastMessage)) {
      console.log("Detected Wikipedia query:", lastMessage);
      const searchTerm = extractWikipediaSearchTerm(lastMessage);
      
      if (searchTerm) {
        console.log("Extracted Wikipedia search term:", searchTerm);
        const wikipediaResult = await searchWikipedia(searchTerm);
        return {
          text: wikipediaResult,
          tokens: estimateTokenCount(wikipediaResult),
          processingTime: Date.now() - startTime,
        };
      }
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

      return {
        text: aiText,
        tokens,
        processingTime,
      };
    } catch (error) {
      console.error("Error calling AI API:", error);
      // Handle common queries with fallback responses when API fails
      if (lastMessageLower.includes('hello') || lastMessageLower.includes('hi')) {
        return {
          text: "Hello! How can I assist you today?",
          tokens: 8,
          processingTime: Date.now() - startTime,
        };
      }
      
      return {
        text: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Is there something simple I can help you with?",
        tokens: 20,
        processingTime: Date.now() - startTime,
      };
    }
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
 * Analyze text and extract potential automation tasks
 */
export async function analyzeForAutomation(text: string): Promise<AutomationTask[]> {
  try {
    const systemPrompt = SYSTEM_PROMPTS.AUTOMATION;
    const messages: Message[] = [
      {
        id: "automation-analysis",
        role: "user",
        content: `Analyze this text and identify any potential automation tasks: ${text}`,
        timestamp: new Date()
      }
    ];

    const response = await processWithAI(messages, systemPrompt);
    
    // Parse the response to extract automation tasks
    // The AI is prompted to return tasks in a specific format
    const taskRegex = /Task: (.+)\nType: (.+)\nDetails: (.+)(?:\n|$)/g;
    const tasks: AutomationTask[] = [];
    let match;
    
    while ((match = taskRegex.exec(response.text)) !== null) {
      tasks.push({
        id: crypto.randomUUID(),
        name: match[1].trim(),
        type: match[2].trim() as "reminder" | "schedule" | "trigger" | "workflow",
        details: match[3].trim(),
        status: "pending",
        createdAt: new Date()
      });
    }
    
    return tasks;
  } catch (error) {
    console.error("Error analyzing for automation:", error);
    return [];
  }
}

/**
 * Generate an automation workflow based on user request
 */
export async function generateAutomationWorkflow(request: string): Promise<string> {
  try {
    const systemPrompt = SYSTEM_PROMPTS.AUTOMATION_WORKFLOW;
    const messages: Message[] = [
      {
        id: "automation-workflow",
        role: "user",
        content: `Create an automation workflow for this request: ${request}`,
        timestamp: new Date()
      }
    ];

    const response = await processWithAI(messages, systemPrompt);
    return response.text;
  } catch (error) {
    console.error("Error generating automation workflow:", error);
    return "I'm sorry, I encountered an error while generating the automation workflow.";
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
