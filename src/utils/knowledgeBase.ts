
import { AIResponse } from "@/types";

/**
 * Knowledge base categories
 */
export enum KnowledgeBaseCategory {
  GENERAL = "general",
  SCIENCE = "science",
  TECHNOLOGY = "technology",
  HISTORY = "history",
  ARTS = "arts",
  BUSINESS = "business",
  HEALTH = "health",
  SPORTS = "sports",
  ENTERTAINMENT = "entertainment"
}

/**
 * Knowledge base source types
 */
export enum KnowledgeBaseSourceType {
  INTERNAL = "internal",
  CACHED = "cached",
  WIKIPEDIA = "wikipedia",
  OFFLINE = "offline",
  CUSTOM = "custom"
}

/**
 * Knowledge base source interface
 */
export interface KnowledgeBaseSource {
  id: string;
  name: string;
  description: string;
  type: KnowledgeBaseSourceType;
  categories: KnowledgeBaseCategory[];
  isActive: boolean;
}

/**
 * Available knowledge base sources
 */
export const KNOWLEDGE_BASE_SOURCES: KnowledgeBaseSource[] = [
  {
    id: "internal-general",
    name: "General Knowledge",
    description: "Basic information about common topics",
    type: KnowledgeBaseSourceType.INTERNAL,
    categories: [KnowledgeBaseCategory.GENERAL],
    isActive: true
  },
  {
    id: "cached-wikipedia",
    name: "Cached Wikipedia",
    description: "Cached articles from Wikipedia for offline access",
    type: KnowledgeBaseSourceType.CACHED,
    categories: [
      KnowledgeBaseCategory.GENERAL, 
      KnowledgeBaseCategory.SCIENCE, 
      KnowledgeBaseCategory.HISTORY
    ],
    isActive: true
  },
  {
    id: "live-wikipedia",
    name: "Live Wikipedia",
    description: "Real-time access to Wikipedia articles",
    type: KnowledgeBaseSourceType.WIKIPEDIA,
    categories: [
      KnowledgeBaseCategory.GENERAL, 
      KnowledgeBaseCategory.SCIENCE, 
      KnowledgeBaseCategory.HISTORY,
      KnowledgeBaseCategory.TECHNOLOGY,
      KnowledgeBaseCategory.ARTS
    ],
    isActive: true
  },
  {
    id: "offline-database",
    name: "Offline Database",
    description: "Locally stored information for offline use",
    type: KnowledgeBaseSourceType.OFFLINE,
    categories: [KnowledgeBaseCategory.GENERAL],
    isActive: true
  },
  {
    id: "tech-docs",
    name: "Technical Documentation",
    description: "Programming languages and technology documentation",
    type: KnowledgeBaseSourceType.CUSTOM,
    categories: [KnowledgeBaseCategory.TECHNOLOGY],
    isActive: true
  }
];

/**
 * Query the knowledge base
 */
export async function queryKnowledgeBase(
  query: string, 
  categories: KnowledgeBaseCategory[] = [KnowledgeBaseCategory.GENERAL],
  sourceTypes: KnowledgeBaseSourceType[] = Object.values(KnowledgeBaseSourceType)
): Promise<AIResponse> {
  try {
    console.log(`Querying knowledge base for: "${query}"`);
    console.log(`Categories: ${categories.join(", ")}`);
    console.log(`Source types: ${sourceTypes.join(", ")}`);
    
    // Filter available sources by category and type
    const availableSources = KNOWLEDGE_BASE_SOURCES.filter(source => 
      source.isActive && 
      sourceTypes.includes(source.type) &&
      source.categories.some(cat => categories.includes(cat))
    );
    
    console.log(`Available sources: ${availableSources.map(s => s.name).join(", ")}`);
    
    if (availableSources.length === 0) {
      return {
        text: `I couldn't find any knowledge sources for "${query}" with the selected categories and source types.`,
        tokens: 0,
        processingTime: 0,
        fromCache: false
      };
    }
    
    // TODO: Implement actual knowledge base querying logic
    // This is a placeholder that would be replaced with actual implementation
    
    // For now, return a mock response
    return {
      text: `Here's what I found about "${query}" from my knowledge base:\n\n` +
        `This information comes from my internal knowledge sources including ${
          availableSources.map(s => s.name).join(", ")
        }.\n\n` +
        `I don't currently have real-time web access, so this information represents my stored knowledge.`,
      tokens: 200,
      processingTime: 100,
      fromCache: false
    };
  } catch (error) {
    console.error("Error querying knowledge base:", error);
    return {
      text: `I encountered an error while searching my knowledge base for "${query}".`,
      tokens: 0,
      processingTime: 0,
      fromCache: false
    };
  }
}

/**
 * Check if a query should use the knowledge base
 */
export function shouldUseKnowledgeBase(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Check for explicit knowledge base queries
  if (lowerQuery.includes("from your knowledge base") || 
      lowerQuery.includes("from your database") ||
      lowerQuery.includes("what do you know about") ||
      lowerQuery.includes("tell me about") ||
      lowerQuery.includes("explain")) {
    return true;
  }
  
  // Check for informational queries
  if (lowerQuery.startsWith("what is") || 
      lowerQuery.startsWith("who is") ||
      lowerQuery.startsWith("where is") ||
      lowerQuery.startsWith("when did") ||
      lowerQuery.startsWith("why did")) {
    return true;
  }
  
  return false;
}
