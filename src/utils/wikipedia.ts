
/**
 * Search Wikipedia and get a summary for a query
 */
export async function searchWikipedia(query: string): Promise<string> {
  try {
    // Search for articles
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return `I couldn't find any Wikipedia information about "${query}".`;
    }
    
    // Get the first result's page ID
    const pageId = searchData.query.search[0].pageid;
    
    // Get the summary for that page
    const summaryUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageId}&format=json&origin=*`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    
    const page = summaryData.query.pages[pageId];
    const summary = page.extract;
    
    if (!summary) {
      return `I found a Wikipedia article about "${query}" but couldn't retrieve a summary.`;
    }
    
    // Truncate long summaries
    const truncatedSummary = summary.length > 500 
      ? summary.substring(0, 500) + "..." 
      : summary;
    
    return `According to Wikipedia: ${truncatedSummary}\n\nSource: https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`;
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return `I'm sorry, I encountered an error while searching Wikipedia for "${query}".`;
  }
}
