import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { JwtPayloadDto } from '../dto';
import { AuthService } from '../services';

@Injectable()
export class JwtExpiredStrategy extends PassportStrategy(
  Strategy,
  'jwt-expired',
) {
  @Inject(AuthService) private authService: AuthService;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    return await this.authService.validateUser(payload);
  }
}
