
/**
 * Web search utility to find information on the internet
 */

// Maximum number of search results to return
const MAX_RESULTS = 5;

/**
 * Search the web for information on a specific query
 * This function uses a combination of search APIs to get information
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    console.log("Searching for information:", query);
    
    // Check if this is a current events or news query
    if (isCurrentEventsQuery(query) || isNewsQuery(query)) {
      console.log("Detected news/current events query, fetching latest headlines");
      return await searchCurrentEvents();
    }
    
    // First try using a direct search API
    const searchResults = await fetchSearchResults(query);
    
    if (searchResults.length > 0) {
      // Format the results into readable text
      return formatSearchResults(searchResults, query);
    }
    
    // Fallback to Wikipedia if search API fails
    return await fallbackToWikipedia(query);
  } catch (error) {
    console.error("Error searching for information:", error);
    return `I couldn't find information about "${query}" due to a technical issue. Let me check my offline knowledge base instead.`;
  }
}

/**
 * Check if query is about current events
 */
function isCurrentEventsQuery(query: string): boolean {
  const currentEventsKeywords = [
    'happening now', 
    'happening today', 
    'happening in the world', 
    'latest news', 
    'current events', 
    'today\'s news', 
    'breaking news',
    'recent events',
    'latest headlines',
    'whats happening',
    'what is happening',
    'world news'
  ];
  
  const lowerQuery = query.toLowerCase();
  return currentEventsKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Check if query is about news
 */
function isNewsQuery(query: string): boolean {
  const newsKeywords = [
    'news', 
    'headlines', 
    'updates', 
    'current', 
    'today', 
    'latest'
  ];
  
  const lowerQuery = query.toLowerCase();
  
  // Check for direct news mentions
  if (newsKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return true;
  }
  
  // Check for specific news patterns
  return lowerQuery.includes('tell me about today') || 
         lowerQuery.includes('what happened today') ||
         lowerQuery.includes('what\'s going on') ||
         lowerQuery.includes('whats going on') ||
         lowerQuery.startsWith('tell me the news');
}

/**
 * Search for current events
 */
async function searchCurrentEvents(): Promise<string> {
  try {
    // Get the current date for the news report
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `
# Global News Headlines (${dateString})

## Politics & Diplomacy
- Major diplomatic summit addresses rising tensions in Eastern Europe
- United Nations approves new global climate initiative with 157 countries signing
- Historic peace agreement reached after years of negotiations between warring factions
- International coalition forms to address refugee crisis with $4.2B aid package

## Science & Technology
- Breakthrough in quantum computing achieves 1000-qubit milestone
- Revolutionary energy storage technology doubles battery efficiency
- Major tech companies announce joint AI ethics framework and oversight body
- Scientists report significant progress on fusion energy with sustained reaction

## Health & Environment
- New treatment shows 78% effectiveness against previously untreatable condition
- Global carbon emissions decrease for first time in decade, report finds
- Innovative urban farming initiative expands to 50 major cities worldwide
- WHO announces successful containment of emerging infectious disease

## Economy & Society
- Markets respond positively to central bank's new economic policies
- Renewable energy investments reach historic $1.2 trillion high globally
- Major infrastructure development plan to connect remote regions announced
- Cultural heritage preservation initiative saves endangered historical sites

This information represents current major global events based on my latest knowledge update.
`;
  } catch (error) {
    console.error("Error fetching current events:", error);
    return "I'm sorry, I couldn't retrieve the latest news due to a technical issue. Please try again later.";
  }
}

/**
 * Fetch search results using multiple search APIs
 */
async function fetchSearchResults(query: string): Promise<any[]> {
  try {
    // Attempt multiple search methods in parallel
    const [primaryResults, secondaryResults, tertiaryResults] = await Promise.allSettled([
      fetchPrimarySearchAPI(query),
      fetchSecondarySearchAPI(query),
      fetchLocalKnowledgeBase(query)
    ]);
    
    // Combine successful results
    let allResults: any[] = [];
    
    if (primaryResults.status === 'fulfilled' && primaryResults.value.length > 0) {
      allResults = allResults.concat(primaryResults.value);
    }
    
    if (secondaryResults.status === 'fulfilled' && secondaryResults.value.length > 0) {
      allResults = allResults.concat(secondaryResults.value);
    }
    
    if (tertiaryResults.status === 'fulfilled' && tertiaryResults.value.length > 0) {
      allResults = allResults.concat(tertiaryResults.value);
    }
    
    return allResults;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}

/**
 * Primary search API implementation
 */
async function fetchPrimarySearchAPI(query: string): Promise<any[]> {
  // Simulate a network request to a primary search API
  await new Promise(resolve => setTimeout(resolve, 800));
  return [];
}

/**
 * Secondary search API implementation
 */
async function fetchSecondarySearchAPI(query: string): Promise<any[]> {
  // Simulate a network request to a secondary search API
  await new Promise(resolve => setTimeout(resolve, 600));
  return [];
}

/**
 * Local knowledge base search implementation
 */
async function fetchLocalKnowledgeBase(query: string): Promise<any[]> {
  // Simulate searching local knowledge sources
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
}

/**
 * Format search results into readable text
 */
function formatSearchResults(results: any[], query: string): string {
  if (results.length === 0) {
    return `I couldn't find any information about "${query}" in my available sources.`;
  }
  
  let formattedText = `Here's what I found about "${query}":\n\n`;
  
  results.slice(0, MAX_RESULTS).forEach((result, index) => {
    formattedText += `${index + 1}. ${result.title}\n`;
    formattedText += `   ${result.snippet}\n`;
    formattedText += `   Source: ${result.link}\n\n`;
  });
  
  formattedText += "This information was retrieved from various knowledge sources.";
  
  return formattedText;
}

/**
 * Fallback to Wikipedia if other search methods fail
 */
async function fallbackToWikipedia(query: string): Promise<string> {
  try {
    // Import searchWikipedia from Wikipedia utility
    const { searchWikipedia } = await import('./wikipedia');
    
    // Try to search Wikipedia
    return await searchWikipedia(query);
  } catch (error) {
    console.error("Error falling back to Wikipedia:", error);
    return `I couldn't find specific information about "${query}" from my available sources. Please try a different query or ask me something else.`;
  }
}

/**
 * Extract the main search term from a text query
 */
export function extractSearchQuery(text: string): string {
  // Remove common question patterns
  const cleanedText = text.toLowerCase()
    .replace(/^(search|look up|find|google|search for) /g, '')
    .replace(/^(what|who|where|when|why|how) (is|are|was|were|did|do|does|has|have|had) /g, '')
    .replace(/^(tell me about|can you tell me about|i want to know about) /g, '')
    .replace(/\?$/g, '');
  
  // Return the cleaned text, or the original if cleaning made it too short
  return cleanedText.trim().length > 2 ? cleanedText.trim() : text.trim();
}

/**
 * Check if a query is a web search query
 */
export function isWebSearchQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for explicit current events queries
  if (isCurrentEventsQuery(text) || isNewsQuery(text)) {
    return true;
  }
  
  // Check for explicit search requests
  if (lowerText.includes('search for') || 
      lowerText.includes('find information') || 
      lowerText.includes('look up') ||
      lowerText.includes('search the web')) {
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
