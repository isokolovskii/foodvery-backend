import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(UserService)
  private readonly userService: UserService;

  private readonly logger = new Logger(LocalStrategy.name);

  validate = async (username: string, password: string) => {
    this.logger.log(`Validating user`);
    const user = await this.userService.findByEmail(username);
    this.logger.log(`Found user: ${user?.uuid ?? false}`);

    if (user && (await compare(password, user.password))) {
      this.logger.log(`User validated ${user.uuid}`);
      return user;
    }

    this.logger.log(`User not found(${!user?.uuid}) or password is wrong`);
    throw new UnauthorizedException();
  };
}
