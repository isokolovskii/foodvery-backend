import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(UserService)
  private readonly userService: UserService;

  validate = async (username: string, password: string) => {
    const user = await this.userService.findByEmail(username);

    if (user && (await compare(password, user.password))) {
      return user;
    }

    throw new UnauthorizedException();
  };
}
