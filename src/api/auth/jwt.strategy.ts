import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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

  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ignoreExpiration: false,
    });
  }

  validate = async (payload: JwtPayload): Promise<JwtValidatedDto> => {
    this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
    const user = await this.userService.findOne(payload.uuid);
    if (!user) {
      this.logger.log(`User with UUID ${payload.uuid} not found`);
      throw new UnauthorizedException();
    }

    this.logger.log(`Validating session for user: ${user.uuid}`);
    const session = await this.refreshTokenService.validateSession(
      user,
      payload.sessionUuid,
    );

    if (!session) {
      this.logger.log(
        `Session ${payload.sessionUuid} not found for user: ${user.uuid}`,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(`JWT payload validated successfully, user: ${user.uuid}`);
    return { user, payload, session };
  };
}
