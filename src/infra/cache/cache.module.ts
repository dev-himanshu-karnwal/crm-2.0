import { Global, Module } from '@nestjs/common';
import { REDIS_CACHE_SERVICE_TOKEN } from '../../common/constants/injection-tokens';
import { RedisCacheService } from './services/redis-cache.service';

/**
 * CacheModule - Wraps RedisCaching functionality.
 * Marked as @Global() so it can be used anywhere in the app without
 * repetitive imports in every feature module.
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CACHE_SERVICE_TOKEN,
      useClass: RedisCacheService,
    },
  ],
  exports: [REDIS_CACHE_SERVICE_TOKEN],
})
export class CacheModule {}
