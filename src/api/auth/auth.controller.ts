import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CreateUserDto } from './create-user.dto';
import type { JwtValidatedDto } from './dtos/jwt-validated.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RemoveSessionDto } from './dtos/remove-session.dto';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: { user: UserEntity; headers: { 'user-agent': string } },
  ) {
    return await this.authService.login(req.user, req.headers['user-agent']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validateUser() {
    return;
  }

  @Post('register')
  async register(
    @Req() req: { headers: { 'user-agent': string } },
    @Body() dto: CreateUserDto,
  ) {
    return await this.authService.register(dto, req.headers['user-agent']);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: { user: JwtValidatedDto }) {
    return await this.authService.logout(req.user.user, req.user.session);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('remove-session')
  async removeSession(
    @Req() req: { user: JwtValidatedDto },
    @Body() dto: RemoveSessionDto,
  ) {
    return await this.authService.removeSession(req.user.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('remove-all-sessions')
  async removeAllSessions(@Req() req: { user: JwtValidatedDto }) {
    return this.authService.removeAllSessions(req.user.user, req.user.session);
  }
}
