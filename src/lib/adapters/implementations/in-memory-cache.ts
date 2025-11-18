/**
 * In-memory cache adapter implementation
 * For development and testing purposes
 */

import { ICacheAdapter } from '../index';

interface CacheEntry {
  value: unknown;
  expiresAt?: number;
}

export class InMemoryCacheAdapter implements ICacheAdapter {
  private cache: Map<string, CacheEntry> = new Map();

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const entry: CacheEntry = {
      value,
    };

    if (ttlSeconds) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Utility method for testing
  size(): number {
    return this.cache.size;
  }
}
