import type {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export class BullConfigService implements SharedBullConfigurationFactory {
  @Inject(ConfigService) private readonly configService: ConfigService;

  createSharedConfiguration(): BullRootModuleOptions {
    return {
      limiter: {
        max: 5,
        duration: 1000,
        bounceBack: false,
      },
      prefix: 'foodvery',
    };
  }
}
