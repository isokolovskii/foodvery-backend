import type { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class JwtConfigService implements JwtOptionsFactory {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: this.configService.get<number>('JWT_EXPIRES_IN'),
      },
    };
  }
}
