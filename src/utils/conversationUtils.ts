
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
