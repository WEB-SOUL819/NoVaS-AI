
import { AIResponse, Message, AutomationTask } from "@/types";
import { processWithAI } from "./aiService";
import { analyzeForAutomation, generateAutomationWorkflow } from "./automationUtils";
import { extractKeywords } from "./conversationUtils";
import { searchWeb, extractSearchQuery } from "./webSearch";
import { searchWikipedia, isWikipediaQuery, extractWikipediaSearchTerm } from "./wikipedia";
import { getCurrentWeather, getWeatherForecast } from "./weatherService";

// Function to determine if a query needs web search
export function isWebSearchQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for explicit current events queries
  if (lowerText.includes('happening now') || 
      lowerText.includes('happening today') || 
      lowerText.includes('happening in the world') || 
      lowerText.includes('latest news') ||
      lowerText.includes('current events') ||
      lowerText.includes('today\'s news') ||
      lowerText.includes('breaking news') ||
      lowerText.includes('recent events') ||
      lowerText.includes('whats happening') ||
      lowerText.includes('what is happening') ||
      lowerText.includes('world news') ||
      lowerText.includes('current news') ||
      lowerText.includes('today news') ||
      lowerText.includes('news headlines')) {
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

// Function to determine if a query is about weather
export function isWeatherQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('weather in') || 
      lowerText.includes('weather at') || 
      lowerText.includes('weather for') ||
      lowerText.includes('what\'s the weather') ||
      lowerText.includes('what is the weather') ||
      lowerText.includes('forecast for') ||
      lowerText.includes('temperature in')) {
    return true;
  }
  
  return false;
}

// Function to extract location from weather query
export function extractWeatherLocation(text: string): string | null {
  const weatherPatterns = [
    /weather (?:in|for|at) (.*)/i,
    /(?:what'?s|what is) the weather (?:like )?(in|for|at)? (.*)/i,
    /forecast (?:for|in) (.*)/i,
    /temperature (?:in|at) (.*)/i,
    /(?:how'?s|how is) the weather (?:in|at) (.*)/i
  ];
  
  for (const pattern of weatherPatterns) {
    const match = text.match(pattern);
    if (match && match.length > 1) {
      // If pattern has "in/for/at" as a captured group, use the next group
      if (match[1].match(/^(in|for|at)$/i) && match.length > 2) {
        return match[2].trim();
      }
      return match[1].trim();
    }
  }
  
  return null;
}

// Add knowledge bases for automation and news
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
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    description: "Image and video processing for automation triggers and actions"
  },
  {
    id: "process-automation",
    name: "Process Automation",
    description: "Automating repetitive business and personal processes"
  },
  {
    id: "trigger-management",
    name: "Trigger Management",
    description: "Event-based triggers and conditions for automation workflows"
  },
  {
    id: "device-integration",
    name: "Device Integration",
    description: "Connecting various devices and platforms into unified automation systems"
  },
  {
    id: "security-automation",
    name: "Security Automation",
    description: "Automated security protocols and responses to security events"
  },
  {
    id: "energy-management",
    name: "Energy Management",
    description: "Smart energy usage optimization and scheduling"
  },
  {
    id: "health-monitoring",
    name: "Health Monitoring",
    description: "Automated health tracking and notification systems"
  },
  {
    id: "news-tracking",
    name: "News Tracking",
    description: "Current events monitoring and reporting from global sources"
  },
  {
    id: "financial-news",
    name: "Financial News",
    description: "Market updates, economic indicators, and business developments"
  },
  {
    id: "tech-trends",
    name: "Technology Trends",
    description: "Latest innovations, product launches, and technology developments"
  },
  {
    id: "global-affairs",
    name: "Global Affairs",
    description: "International relations, political developments, and world events"
  },
  {
    id: "science-news",
    name: "Science News",
    description: "Scientific discoveries, research breakthroughs, and advancements"
  },
  {
    id: "sports-updates",
    name: "Sports Updates",
    description: "Latest scores, player news, and sporting events worldwide"
  },
  {
    id: "entertainment-news",
    name: "Entertainment News",
    description: "Celebrity updates, movie releases, and entertainment industry news"
  },
  {
    id: "weather-forecasting",
    name: "Weather Forecasting",
    description: "Weather patterns, forecasts, and meteorological information"
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
  extractWikipediaSearchTerm,
  getCurrentWeather,
  getWeatherForecast
};
