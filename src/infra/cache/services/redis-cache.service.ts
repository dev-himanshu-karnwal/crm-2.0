import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICacheService } from '../interfaces/cache-service.interface';

@Injectable()
export class RedisCacheService
  implements ICacheService, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Lifecycle hook: Called when the module has been initialized.
   * We establish the connection to Redis here.
   */
  onModuleInit() {
    const host = this.configService.get<string>('redis.host');
    const port = this.configService.get<number>('redis.port');
    const password = this.configService.get<string>('redis.password');

    this.logger.log(`Connecting to Redis at ${host}:${port}...`);

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });
  }

  /**
   * Lifecycle hook: Called when the application is shutting down.
   * Ensures the Redis connection is closed gracefully.
   */
  async onModuleDestroy() {
    this.logger.log('Disconnecting from Redis...');
    await this.client.quit();
  }

  /**
   * Retrieves data from Redis and parses it from JSON.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error getting key "${key}" from cache:`, error);
      return null;
    }
  }

  /**
   * Stores data in Redis as a JSON string.
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, serializedValue, 'EX', ttl);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error(`Error setting key "${key}" in cache:`, error);
    }
  }

  /**
   * Removes a key from Redis.
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key "${key}" from cache:`, error);
    }
  }

  /**
   * Flushes all data from the current Redis database.
   */
  async reset(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }
}
