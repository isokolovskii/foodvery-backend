import {
  Body,
  Controller,
  Inject,
  Ip,
  Post,
  UseGuards,
  Headers,
  Delete,
  Get,
} from '@nestjs/common';
import {
  AccessService,
  AuthService,
  EmailConfirmationService,
} from '../services';
import type { Request } from 'express';
import {
  CreateUserDto,
  JwtPayloadDto,
  LoginDto,
  RefreshTokenDto,
  UserMetaDto,
  ConfirmEmailDto,
  AuthorizedDto,
  RevokeSessionDto,
} from '../dto';
import { JwtGuard } from '../guards';
import { Authorization } from '../decorators';
import { JwtExpiredGuard } from '../guards/jwt-expired.guard';

@Controller('auth')
export class AuthController {
  @Inject(AuthService) private readonly authService: AuthService;
  @Inject(AccessService) private readonly accessService: AccessService;
  @Inject(EmailConfirmationService)
  private readonly emailConfirmationService: EmailConfirmationService;

  @Post('login')
  async login(
    @Ip() ip: string,
    @Headers() headers: Request['headers'],
    @Body() dto: LoginDto,
  ) {
    const user = await this.authService.login(dto);
    const userMeta = new UserMetaDto({
      userAgent: headers['user-agent'],
      ip: ip,
    });

    return await this.accessService.generateToken(user, userMeta);
  }

  @Post('register')
  async register(
    @Ip() ip: string,
    @Headers() headers: Request['headers'],
    @Body() dto: CreateUserDto,
  ) {
    const user = await this.authService.register(dto);
    const userMeta = new UserMetaDto({
      userAgent: headers['user-agent'],
      ip: ip,
    });

    return await this.accessService.generateToken(user, userMeta);
  }

  @Post('validate')
  @UseGuards(JwtGuard)
  async validateToken() {
    return;
  }

  @Post('refresh')
  @UseGuards(JwtExpiredGuard)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.accessService.refreshToken(dto);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@Authorization() { session }: AuthorizedDto) {
    return await this.accessService.removeSession(session);
  }

  @Post('send-confirm-email')
  @UseGuards(JwtGuard)
  async sendConfirmEmail(@Authorization() { user }: AuthorizedDto) {
    return await this.emailConfirmationService.sendConfirmationEmail(user);
  }

  @Post('confirm-email')
  @UseGuards(JwtGuard)
  async verifyEmail(
    @Authorization() payload: JwtPayloadDto,
    @Body() dto: ConfirmEmailDto,
  ) {
    return await this.authService.verifyEmail(dto, payload);
  }

  @Get('sessions')
  @UseGuards(JwtGuard)
  async sessions(@Authorization() { user }: AuthorizedDto) {
    return await this.accessService.sessions(user);
  }

  @Delete('sessions')
  @UseGuards(JwtGuard)
  async revokeSessions(
    @Authorization() { user }: AuthorizedDto,
    @Body() dto: RevokeSessionDto,
  ) {
    return await this.accessService.revokeSession(dto, user);
  }

  @Delete('sessions/all')
  @UseGuards(JwtGuard)
  async revokeAllSessions(@Authorization() { user, session }: AuthorizedDto) {
    return await this.accessService.revokeAllSessions(user, session);
  }
}
