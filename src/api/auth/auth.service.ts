import {
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { RemoveSessionDto } from './dtos/remove-session.dto';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;
  @Inject(RefreshTokenService)
  private readonly refreshTokenService: RefreshTokenService;

  login = async (
    user: UserEntity,
    userAgent: string,
  ): Promise<LoginResponseDto> => {
    const session = await this.refreshTokenService.createRefreshToken(
      user,
      userAgent,
    );

    const payload: JwtPayload = {
      email: user.email,
      uuid: user.uuid,
      sessionUuid: session.uuid,
    };

    delete user.password;
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
    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      throw new HttpException(
        { message: 'User with specified email already exists' },
        400,
      );
    }

    const salf = await genSalt(10);

    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: await hash(dto.password, salf),
    });

    return await this.login(user, userAgent);
  };

  refresh = async ({ token, refreshToken }: TokensDto): Promise<TokensDto> => {
    const { sessionUuid, uuid } = this.jwtService.verify<JwtPayload>(token, {
      ignoreExpiration: true,
    });

    const session = await this.refreshTokenService.updateRefreshToken(
      sessionUuid,
      uuid,
      refreshToken,
    );

    const payload: JwtPayload = {
      email: session.user.email,
      uuid: session.user.uuid,
      sessionUuid: session.uuid,
    };

    return {
      token: this.jwtService.sign(payload),
      refreshToken: session.refreshToken,
    };
  };

  logout = async (user: UserEntity, session: SessionEntity) => {
    await this.refreshTokenService.removeSession(user, session.uuid);
  };

  removeSession = async (user: UserEntity, dto: RemoveSessionDto) => {
    return await this.refreshTokenService.removeSession(user, dto.session);
  };

  removeAllSessions = async (user: UserEntity, session: SessionEntity) => {
    return await this.refreshTokenService.removeAllSessions(user, session);
  };
}
