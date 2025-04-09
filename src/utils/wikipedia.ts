
/**
 * Search Wikipedia and get a summary for a query
 */
export async function searchWikipedia(query: string): Promise<string> {
  try {
    // Sanitize and prepare the query
    const sanitizedQuery = query.trim();
    
    if (!sanitizedQuery) {
      return "I need a specific topic to search for on Wikipedia.";
    }
    
    console.log("Searching Wikipedia for:", sanitizedQuery);
    
    // Search for articles
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(sanitizedQuery)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return `I couldn't find any Wikipedia information about "${sanitizedQuery}".`;
    }
    
    // Get the first result's page ID
    const pageId = searchData.query.search[0].pageid;
    const pageTitle = searchData.query.search[0].title;
    
    // Get the summary for that page
    const summaryUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageId}&format=json&origin=*`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    const page = summaryData.query.pages[pageId];
    const summary = page.extract;
    
    if (!summary) {
      return `I found a Wikipedia article about "${pageTitle}" but couldn't retrieve a summary.`;
    }
    
    // Truncate long summaries
    const truncatedSummary = summary.length > 500 
      ? summary.substring(0, 500) + "..." 
      : summary;
    
    return `According to Wikipedia: ${truncatedSummary}\n\nSource: https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return `I'm sorry, I encountered an error while searching Wikipedia for "${query}".`;
  }
}

/**
 * Extract keyword from text for Wikipedia search
 * This function identifies potential topics in a query
 */
export function extractWikipediaSearchTerm(text: string): string | null {
  // Remove common question patterns
  const cleanedText = text.toLowerCase()
    .replace(/^(what|who|where|when|why|how) (is|are|was|were|did|do|does|has|have|had) /g, '')
    .replace(/^(tell me|explain|describe|information) (about|on|regarding) /g, '')
    .replace(/^(search|find|lookup|wikipedia) (for|about|on) /g, '')
    .replace(/^(i want to know|i'd like to know|i would like to know|can you tell me) (about|what|who|where|when|why|how) /g, '')
    .replace(/^(do you know|please tell me|please explain) (about|what|who|where|when|why|how) /g, '')
    .replace(/\?$/g, '');
  
  // If query became too short after cleaning, return the original text
  return cleanedText.trim().length > 2 ? cleanedText.trim() : text.trim();
}

/**
 * Determine if a message likely contains a query that should be searched on Wikipedia
 */
export function isWikipediaQuery(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Direct Wikipedia mentions
  if (lowerText.includes('wikipedia') || 
      lowerText.includes('look up') || 
      lowerText.includes('search for')) {
    return true;
  }
  
  // Common knowledge question patterns
  const knowledgePatterns = [
    /^(what|who|where|when) (is|are|was|were) /i,
    /^(tell me|explain|describe) (about|on) /i,
    /^(information|details|facts) (about|on|regarding) /i,
    /^(do you know|can you tell me) (about|what|who|where|when) /i,
    /history of /i,
    /definition of /i,
    /meaning of /i,
    /origin of /i,
    / biography$/i,
    / summary$/i,
    / overview$/i,
    / definition$/i,
  ];
  
  return knowledgePatterns.some(pattern => pattern.test(lowerText));
}
