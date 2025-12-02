import { logger } from '../utils/logger.js';

export class MemoryCache {
  constructor(defaultTtlSeconds = 60) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000; // Convert to milliseconds
  }

  set(key, value, ttlSeconds = null) {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
    const expiry = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiry,
    });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async getOrSet(key, fetchFunction, ttlSeconds = null) {
    const cachedValue = this.get(key);

    if (cachedValue !== null) {
      logger.info(`Cache hit for key: ${key}`);
      return cachedValue;
    }

    logger.info(`Cache miss for key: ${key}. Fetching data...`);
    try {
      const value = await fetchFunction();
      this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      throw error;
    }
  }

  clear() {
    this.cache.clear();
  }
}
