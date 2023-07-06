import type {
  CacheModuleOptions,
  CacheOptionsFactory,
} from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class CacheManagerService implements CacheOptionsFactory {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  createCacheOptions = (): CacheModuleOptions<RedisClientOptions> => {
    return {
      store: redisStore,
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    };
  };
}
