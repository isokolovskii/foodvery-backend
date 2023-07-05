import { HttpException, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './jwt.payload';
import { User } from '../user/user.entity';
import { genSalt, hash } from 'bcrypt';
import { CreateUserDto } from './create-user.dto';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private readonly userService: UserService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  login = async (user: User) => {
    const payload: JwtPayload = { email: user.email, uuid: user.uuid };
    delete user.password;
    return { token: this.jwtService.sign(payload), user };
  };

  register = async (dto: CreateUserDto) => {
    const existingUser = await this.userService.findByEmail(dto.email);

    if (existingUser) {
      throw new HttpException(
        { message: 'User with specified email already exists' },
        400,
      );
    }

    const salf = await genSalt(10);

    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: await hash(dto.password, salf),
    });

    return await this.login(user);
  };
}
