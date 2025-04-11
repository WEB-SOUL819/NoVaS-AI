
import { AIResponse, Message, AutomationTask } from "@/types";
import { processWithAI } from "./aiService";
import { analyzeForAutomation, generateAutomationWorkflow } from "./automationUtils";
import { extractKeywords } from "./conversationUtils";
import { searchWeb } from "./webSearch";
import { searchWikipedia, isWikipediaQuery, extractWikipediaSearchTerm } from "./wikipedia";

// Function to determine if a query needs web search
export function isWebSearchQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for explicit search requests
  if (lowerText.includes('search for') || 
      lowerText.includes('find information') || 
      lowerText.includes('look up') ||
      lowerText.includes('search the web')) {
    return true;
  }
  
  // Check for current events related queries
  if (lowerText.includes('latest') || 
      lowerText.includes('recent') || 
      lowerText.includes('news') ||
      lowerText.includes('current')) {
    return true;
  }
  
  // Check for fact-based questions that would benefit from web data
  if (lowerText.startsWith('what is') || 
      lowerText.startsWith('who is') || 
      lowerText.startsWith('where is') ||
      lowerText.startsWith('when did')) {
    return true;
  }
  
  return false;
}

// Export the main functions from this file to maintain backwards compatibility
export { 
  processWithAI, 
  analyzeForAutomation, 
  generateAutomationWorkflow, 
  extractKeywords,
  searchWeb,
  searchWikipedia,
  isWikipediaQuery,
  extractWikipediaSearchTerm
};
