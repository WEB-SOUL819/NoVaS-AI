
/**
 * SQLite-based caching utility for application data
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheDB extends DBSchema {
  cache: {
    key: string;
    value: CacheEntry;
    indexes: { 'by-timestamp': number };
  };
}

class SQLiteCache {
  private db: Promise<IDBPDatabase<CacheDB>>;
  private dbName = 'app-cache-db';
  private defaultTTL = 3600000; // 1 hour in milliseconds

  constructor() {
    this.db = this.initDatabase();
  }

  private async initDatabase(): Promise<IDBPDatabase<CacheDB>> {
    return openDB<CacheDB>(this.dbName, 1, {
      upgrade(db) {
        const store = db.createObjectStore('cache', { keyPath: 'key' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  /**
   * Set a value in the cache
   */
  async set(key: string, data: any, ttl?: number): Promise<void> {
    const db = await this.db;
    const timestamp = Date.now();
    const entry: CacheEntry = {
      key,
      data,
      timestamp,
      ttl: ttl || this.defaultTTL,
    };
    
    await db.put('cache', entry);
    console.log(`Cached data for key: ${key}`);
  }

  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.db;
      const entry = await db.get('cache', key);
      
      if (!entry) {
        console.log(`Cache miss for key: ${key}`);
        return null;
      }
      
      // Check if entry is expired
      if (Date.now() > entry.timestamp + entry.ttl) {
        console.log(`Cache entry expired for key: ${key}`);
        await this.delete(key);
        return null;
      }
      
      console.log(`Cache hit for key: ${key}`);
      return entry.data as T;
    } catch (error) {
      console.error(`Error retrieving from cache: ${error}`);
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  async delete(key: string): Promise<void> {
    const db = await this.db;
    await db.delete('cache', key);
    console.log(`Deleted cache entry for key: ${key}`);
  }

  /**
   * Clear all values from the cache
   */
  async clear(): Promise<void> {
    const db = await this.db;
    await db.clear('cache');
    console.log('Cache cleared');
  }

  /**
   * Clear expired entries from the cache
   */
  async clearExpired(): Promise<void> {
    const db = await this.db;
    const now = Date.now();
    
    const tx = db.transaction('cache', 'readwrite');
    const index = tx.store.index('by-timestamp');
    
    // Get all entries
    const entries = await index.getAll();
    
    // Delete expired entries
    const expiredKeys = entries
      .filter(entry => now > entry.timestamp + entry.ttl)
      .map(entry => entry.key);
      
    for (const key of expiredKeys) {
      await tx.store.delete(key);
    }
    
    await tx.done;
    console.log(`Cleared ${expiredKeys.length} expired cache entries`);
  }
}

// Export a singleton instance
export const sqliteCache = new SQLiteCache();

