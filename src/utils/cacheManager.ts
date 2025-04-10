
import { sqliteCache } from './sqliteCache';

/**
 * Initializes periodic cache maintenance tasks
 */
export function initCacheManager(): { cleanup: () => void } {
  // Set up interval to clean expired entries (every 30 minutes)
  const intervalId = setInterval(() => {
    console.log('Running scheduled cache maintenance...');
    sqliteCache.clearExpired()
      .then(result => console.log('Cache maintenance completed'))
      .catch(error => console.error('Cache maintenance error:', error));
  }, 30 * 60 * 1000);

  // Return cleanup function to clear interval when needed
  return {
    cleanup: () => clearInterval(intervalId)
  };
}

