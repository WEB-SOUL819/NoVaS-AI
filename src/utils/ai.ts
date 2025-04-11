
import { AIResponse, Message, AutomationTask } from "@/types";
import { processWithAI } from "./aiService";
import { analyzeForAutomation, generateAutomationWorkflow } from "./automationUtils";
import { extractKeywords } from "./conversationUtils";
import { searchWeb, extractSearchQuery } from "./webSearch";
import { searchWikipedia, isWikipediaQuery, extractWikipediaSearchTerm } from "./wikipedia";

// Function to determine if a query needs web search
export function isWebSearchQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for current events queries
  if (lowerText.includes('happening now') || 
      lowerText.includes('happening today') || 
      lowerText.includes('happening in the world') || 
      lowerText.includes('latest news') ||
      lowerText.includes('current events') ||
      lowerText.includes('today\'s news') ||
      lowerText.includes('breaking news') ||
      lowerText.includes('recent events')) {
    return true;
  }
  
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

// Add knowledge bases for automation
export const AUTOMATION_KNOWLEDGE_BASES = [
  {
    id: "home-automation",
    name: "Home Automation",
    description: "Knowledge about smart home systems, routines, and device automation"
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    description: "Information about business processes, task automation, and productivity"
  },
  {
    id: "iot-devices",
    name: "IoT Devices",
    description: "Integration with Internet of Things devices and sensors"
  },
  {
    id: "time-scheduling",
    name: "Time & Scheduling",
    description: "Calendar management, reminders, and time-based triggers"
  },
  {
    id: "voice-commands",
    name: "Voice Commands",
    description: "Voice-activated automation and natural language processing"
  },
  {
    id: "data-processing",
    name: "Data Processing",
    description: "Automated data collection, analysis, and reporting"
  },
  {
    id: "ai-automation",
    name: "AI-Powered Automation",
    description: "Using artificial intelligence to enhance automation capabilities"
  }
];

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
