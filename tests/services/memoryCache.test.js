import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MemoryCache } from '../../src/services/memoryCache.js';

describe('MemoryCache', () => {
  let cache;
  const defaultTtl = 60; // 60 seconds

  beforeEach(() => {
    cache = new MemoryCache(defaultTtl);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      cache.set(key, value);
      const result = cache.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should overwrite existing value for same key', () => {
      const key = 'test-key';
      cache.set(key, 'value1');
      cache.set(key, 'value2');

      expect(cache.get(key)).toBe('value2');
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire item after default TTL', () => {
      const key = 'test-key';
      cache.set(key, 'value');

      // Fast-forward time by default TTL + 1 second
      jest.advanceTimersByTime((defaultTtl + 1) * 1000);

      expect(cache.get(key)).toBeNull();
    });

    it('should not expire item before TTL', () => {
      const key = 'test-key';
      cache.set(key, 'value');

      // Fast-forward time by default TTL - 1 second
      jest.advanceTimersByTime((defaultTtl - 1) * 1000);

      expect(cache.get(key)).toBe('value');
    });

    it('should respect custom TTL provided in set', () => {
      const key = 'custom-ttl-key';
      const customTtl = 10; // 10 seconds
      cache.set(key, 'value', customTtl);

      // Fast-forward past custom TTL
      jest.advanceTimersByTime((customTtl + 1) * 1000);
      expect(cache.get(key)).toBeNull();
    });
  });

  describe('getOrSet (Cache-Aside Pattern)', () => {
    it('should return cached value if exists', async () => {
      const key = 'existing-key';
      const cachedValue = 'cached-data';
      const fetchFunction = jest.fn().mockResolvedValue('new-data');

      cache.set(key, cachedValue);
      const result = await cache.getOrSet(key, fetchFunction);

      expect(result).toBe(cachedValue);
      expect(fetchFunction).not.toHaveBeenCalled();
    });

    it('should fetch, store, and return value if not in cache', async () => {
      const key = 'new-key';
      const fetchedValue = 'fetched-data';
      const fetchFunction = jest.fn().mockResolvedValue(fetchedValue);

      const result = await cache.getOrSet(key, fetchFunction);

      expect(result).toBe(fetchedValue);
      expect(fetchFunction).toHaveBeenCalledTimes(1);
      expect(cache.get(key)).toBe(fetchedValue);
    });

    it('should handle fetch function errors', async () => {
      const key = 'error-key';
      const error = new Error('Fetch failed');
      const fetchFunction = jest.fn().mockRejectedValue(error);

      await expect(cache.getOrSet(key, fetchFunction)).rejects.toThrow('Fetch failed');
      expect(cache.get(key)).toBeNull();
    });
  });

  describe('cache cleaning', () => {
    it('should not leak memory with expired items (cleanup check)', () => {
        // This is a bit hard to test deterministically without exposing internal state,
        // but we can verify that expired items are treated as gone.
        // A real implementation might use a periodic cleanup or cleanup on access.
        // Here we just ensure behavioral correctness of expiration.
        const key = 'expired';
        cache.set(key, 'value', 1);
        jest.advanceTimersByTime(1100);
        expect(cache.get(key)).toBeNull();
    });
  });
});

