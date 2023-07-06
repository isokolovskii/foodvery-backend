import type { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RefreshJwtConfigService implements JwtOptionsFactory {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      signOptions: {
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
      },
    };
  }
}
