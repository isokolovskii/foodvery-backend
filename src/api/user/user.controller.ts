import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import type { JwtValidatedDto } from '../auth/dtos/jwt-validated.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  a;
}
