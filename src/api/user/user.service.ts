import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import type { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from '../auth/create-user.dto';
import { RefreshTokenService } from '../auth/refresh-token/refresh-token.service';
import { RemoveSessionDto } from '../auth/dtos/remove-session.dto';
import { SessionEntity } from '../auth/refresh-token/session.entity';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailEvents } from '../../mail/mail.events';
import { SendConfirmEmailEvent } from '../../mail/events/send-confirm-email.event';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @Inject(RefreshTokenService)
  private readonly refreshTokenService: RefreshTokenService;
  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2;
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  private emailConfirmationCacheKey = (user: UserEntity) =>
    `email-confirmation:${user.uuid}`;

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

  sendConfirmEmail = async (user: UserEntity) => {
    if (user.emailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    const code = Math.floor(Math.random() * 1000000).toString();

    await this.cacheManager.set(
      this.emailConfirmationCacheKey(user),
      code,
      1000 * 60 * 60 * 24,
    );

    if (!user.emailConfirmed) {
      this.eventEmitter.emit(
        MailEvents['mail.confirm-email'],
        new SendConfirmEmailEvent(user, code),
      );
    }
  };

  confirmEmail = async (user: UserEntity, dto: ConfirmEmailDto) => {
    const code = await this.cacheManager.get(
      this.emailConfirmationCacheKey(user),
    );

    if (code !== dto.code) {
      throw new BadRequestException('Invalid confirmation code');
    }

    user.emailConfirmed = true;

    await this.userRepository.save(user);

    await this.cacheManager.del(this.emailConfirmationCacheKey(user));
  };
}
