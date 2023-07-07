import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { JwtPayloadDto } from '../dto';
import { AuthService } from '../services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(AuthService) private authService: AuthService;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    return await this.authService.validateUser(payload);
  }
}
