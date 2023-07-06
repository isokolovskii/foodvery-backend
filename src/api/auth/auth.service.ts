import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './jwt.payload';
import { UserEntity } from '../user/user.entity';
import { genSalt, hash } from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import type { LoginResponseDto } from './dtos/login-response.dto';
import type { TokensDto } from './dtos/tokens.dto';
import { SessionEntity } from './refresh-token/session.entity';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;
  @Inject(RefreshTokenService)
  private readonly refreshTokenService: RefreshTokenService;

  private readonly logger = new Logger(AuthService.name);

  login = async (
    user: UserEntity,
    userAgent: string,
  ): Promise<LoginResponseDto> => {
    this.logger.log(`Logging in user ${user.uuid}`);
    const session = await this.refreshTokenService.createRefreshToken(
      user,
      userAgent,
    );
    this.logger.log(`Created session ${session.uuid}`);

    const payload: JwtPayload = {
      email: user.email,
      uuid: user.uuid,
      sessionUuid: session.uuid,
    };

    delete user.password;
    this.logger.log(`Logged in user ${user.uuid} and generated JWT tokens`);
    return {
      token: this.jwtService.sign(payload),
      refreshToken: session.refreshToken,
      user,
    };
  };

  register = async (
    dto: CreateUserDto,
    userAgent: string,
  ): Promise<LoginResponseDto> => {
    this.logger.log(`Registering user`);
    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      this.logger.log(`User with this email already exists`);
      throw new HttpException(
        { message: 'User with specified email already exists' },
        400,
      );
    }

    this.logger.log('Creating user');
    const salf = await genSalt(10);

    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: await hash(dto.password, salf),
    });
    this.logger.log(`Created user ${user.uuid}`);

    this.logger.log(
      `Sending confirmation email to user ${user.uuid} after registration`,
    );
    await this.userService.sendConfirmEmail(user);

    this.logger.log(`User ${user.uuid} registered, attempting to login`);
    return await this.login(user, userAgent);
  };

  refresh = async ({ token, refreshToken }: TokensDto): Promise<TokensDto> => {
    const { sessionUuid, uuid } = this.jwtService.verify<JwtPayload>(token, {
      ignoreExpiration: true,
    });
    this.logger.log(`Refreshing session ${sessionUuid} for user ${uuid}`);

    const session = await this.refreshTokenService.updateRefreshToken(
      sessionUuid,
      uuid,
      refreshToken,
    );

    this.logger.log(`Refreshed session ${session.uuid}`);

    const payload: JwtPayload = {
      email: session.user.email,
      uuid: session.user.uuid,
      sessionUuid: session.uuid,
    };

    this.logger.log(`Generated JWT tokens for user ${uuid}`);
    return {
      token: this.jwtService.sign(payload),
      refreshToken: session.refreshToken,
    };
  };

  logout = async (user: UserEntity, session: SessionEntity) => {
    this.logger.log(`Logging out user ${user.uuid}`);
    await this.refreshTokenService.removeSession(user, session.uuid);
    this.logger.log(`Logged out user ${user.uuid}`);
  };
}
