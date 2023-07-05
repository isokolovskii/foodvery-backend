import { Controller, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: User }) {
    const token = await this.authService.login(req.user);
    delete req.user.password;
    return { token, ...req.user };
  }
}
