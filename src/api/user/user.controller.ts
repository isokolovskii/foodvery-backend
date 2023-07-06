import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { JwtValidatedDto } from '../auth/dtos/jwt-validated.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RemoveSessionDto } from '../auth/dtos/remove-session.dto';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  public async getUser(@Req() req: { user: JwtValidatedDto }) {
    return req.user.user;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('sessions')
  public async getSessions(@Req() req: { user: JwtValidatedDto }) {
    return this.userService.sessions(req.user.user);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('sessions')
  async removeSession(
    @Req() req: { user: JwtValidatedDto },
    @Body() dto: RemoveSessionDto,
  ) {
    return await this.userService.removeSession(req.user.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('sessions/all')
  async removeAllSessions(@Req() req: { user: JwtValidatedDto }) {
    return this.userService.removeAllSessions(req.user.user, req.user.session);
  }
}
