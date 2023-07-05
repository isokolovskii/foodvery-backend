import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import type { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from '../auth/create-user.dto';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  findOne = async (uuid: string): Promise<User | null> => {
    return await this.userRepository.findOne({
      where: { uuid },
    });
  };

  findByEmail = async (email: string): Promise<User | null> => {
    return await this.userRepository.findOne({
      where: { email },
    });
  };

  create = async ({ name, password, email }: CreateUserDto) => {
    const user = this.userRepository.create();
    user.name = name;
    user.uuid = uuid();
    user.email = email;
    user.password = password;
    return await this.userRepository.save(user);
  };
}
