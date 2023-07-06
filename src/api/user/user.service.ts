import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import type { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from '../auth/create-user.dto';
import { RefreshTokenService } from '../auth/refresh-token/refresh-token.service';
import { RemoveSessionDto } from '../auth/dtos/remove-session.dto';
import { SessionEntity } from '../auth/refresh-token/session.entity';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @Inject(RefreshTokenService)
  private readonly refreshTokenService: RefreshTokenService;

  findOne = async (uuid: string): Promise<UserEntity | null> => {
    return await this.userRepository.findOne({
      where: { uuid },
    });
  };

  findByEmail = async (email: string): Promise<UserEntity | null> => {
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

  sessions = async (user: UserEntity) => {
    const { sessions } = await this.userRepository.findOne({
      where: { uuid: user.uuid },
      relations: { sessions: true },
    });
    return sessions;
  };

  removeSession = async (user: UserEntity, dto: RemoveSessionDto) => {
    return await this.refreshTokenService.removeSession(user, dto.session);
  };

  removeAllSessions = async (user: UserEntity, session: SessionEntity) => {
    return await this.refreshTokenService.removeAllSessions(user, session);
  };
}
