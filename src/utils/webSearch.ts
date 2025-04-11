
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
    // First try using a direct search API (Google Programmable Search JSON API)
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
 * Fetch search results using a search API
 */
async function fetchSearchResults(query: string): Promise<any[]> {
  try {
    // For now, we'll use a mock implementation since integrating actual search APIs
    // would require API keys that we don't want to expose
    
    // Simulate a network request
    console.log("Searching the web for:", query);
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
