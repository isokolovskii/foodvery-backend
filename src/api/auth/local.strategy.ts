import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(AuthService)
  private readonly authService: AuthService;

  validate = async (dto: AuthDto) => {
    const user = await this.authService.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  };
}
