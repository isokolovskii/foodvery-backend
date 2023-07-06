import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { JwtPayload } from './jwt.payload';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { UserService } from '../user/user.service';
import { JwtValidatedDto } from './dtos/jwt-validated.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(RefreshTokenService)
  private readonly refreshTokenService: RefreshTokenService;
  @Inject(UserService)
  private readonly userService: UserService;

  constructor(private configService: ConfigService) {
    super({
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ignoreExpiration: false,
    });
  }

  validate = async (payload: JwtPayload): Promise<JwtValidatedDto> => {
    const user = await this.userService.findOne(payload.uuid);
    if (!user) {
      throw new UnauthorizedException();
    }

    const session = await this.refreshTokenService.validateSession(
      user,
      payload.sessionUuid,
    );

    if (!session) {
      throw new UnauthorizedException();
    }

    return { user, payload, session };
  };
}
