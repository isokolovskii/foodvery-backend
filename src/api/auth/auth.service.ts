import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import type { AuthDto } from './auth.dto';
import type { JwtPayload } from './jwt.payload';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  async validateUser({ email, password }: AuthDto) {
    const user = await this.userService.findByEmail(email);
    if (user && user.password === password) {
      delete user.password;
      return user;
    }
    return null;
  }

  login = async (user: User) => {
    const payload: JwtPayload = { email: user.email, uuid: user.uuid };
    return this.jwtService.sign(payload);
  };
}
