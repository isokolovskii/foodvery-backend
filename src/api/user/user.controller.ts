import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.payload';
import { NotFoundError } from 'rxjs';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getUser(@Request() req: { user: JwtPayload }) {
    const user = await this.userService.findOne(req.user.uuid);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    delete user.password;

    return user;
  }
}
