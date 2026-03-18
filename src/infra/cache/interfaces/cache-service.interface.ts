/**
 * Interface for Cache Service
 * Following the Dependency Inversion Principle, this allows the application
 * to depend on a stable abstraction rather than a volatile implementation.
 */
export interface ICacheService {
  /**
   * Retrieve a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value in the cache
   * @param key The cache key
   * @param value The value to store (will be JSON stringified)
   * @param ttl Optional Time-to-Live in seconds
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Remove a value from the cache
   * @param key The cache key
   */
  del(key: string): Promise<void>;

  /**
   * Clear the entire cache (use with caution)
   */
  reset(): Promise<void>;
}
