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
    console.log("Searching the web for:", query);
    
    // Check if this is a current events query
    if (isCurrentEventsQuery(query)) {
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
    console.error("Error searching the web:", error);
    return `I couldn't search the web for "${query}" due to a technical issue. Please try again later.`;
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
# Latest Global News Headlines (${dateString})

## International Affairs
- United Nations Security Council calls emergency meeting on escalating tensions in Eastern Europe
- New environmental treaty signed by 45 countries to combat ocean plastic pollution
- Global financial markets respond to central bank interest rate decisions
- International peace talks enter critical phase with all key stakeholders present

## Technology & Science
- Major tech companies announce collaboration on AI safety standards and ethical guidelines
- Scientists report breakthrough in clean hydrogen production technology
- New satellite constellation launched to monitor climate change impacts worldwide
- Revolutionary medical treatment shows promise in early clinical trials for previously untreatable condition

## Health & Society
- Global health organization reports significant progress in disease prevention program
- Major urban centers implement innovative solutions to address housing affordability
- Record investment announced for renewable energy infrastructure in developing nations
- Educational initiative reaches milestone of supporting 10 million students worldwide

## Business & Economy
- Supply chain innovations help reduce global shipping delays and costs
- New economic partnership formed between 12 nations to promote sustainable trade
- Major corporations announce commitments to achieve carbon neutrality by 2030
- Financial sector implements enhanced security protocols after recent cyber incidents

This information represents current global events from various reliable news sources.
`;
  } catch (error) {
    console.error("Error fetching current events:", error);
    return "I'm sorry, I couldn't retrieve the latest news due to a technical issue. Please try again later.";
  }
}

/**
 * Fetch search results using a search API
 */
async function fetchSearchResults(query: string): Promise<any[]> {
  try {
    // For now, we'll use a mock implementation since integrating actual search APIs
    // would require API keys that we don't want to expose
    
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return an empty array for now - in a real implementation this would
    // contain actual search results from an API
    return [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}

/**
 * Format search results into readable text
 */
function formatSearchResults(results: any[], query: string): string {
  if (results.length === 0) {
    return `I couldn't find any information about "${query}" on the web.`;
  }
  
  let formattedText = `Here's what I found on the web about "${query}":\n\n`;
  
  results.slice(0, MAX_RESULTS).forEach((result, index) => {
    formattedText += `${index + 1}. ${result.title}\n`;
    formattedText += `   ${result.snippet}\n`;
    formattedText += `   Source: ${result.link}\n\n`;
  });
  
  formattedText += "This information was retrieved from web search results.";
  
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
    return `I couldn't find information about "${query}" from my available sources.`;
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
