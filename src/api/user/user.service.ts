import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
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

  private readonly logger = new Logger(UserService.name);

  private emailConfirmationCacheKey = (user: UserEntity) =>
    `email-confirmation:${user.uuid}`;

  findOne = async (uuid: string): Promise<UserEntity | null> => {
    this.logger.log(`Find user with uuid: ${uuid}`);
    const user = await this.userRepository.findOne({
      where: { uuid },
    });
    this.logger.log(`User found: ${user?.uuid ?? false}`);
    return user;
  };

  findByEmail = async (email: string): Promise<UserEntity | null> => {
    this.logger.log('Find user by email');
    const user = await this.userRepository.findOne({
      where: { email },
    });
    this.logger.log(`User found: ${user?.uuid ?? false}`);
    return user;
  };

  create = async ({ name, password, email }: CreateUserDto) => {
    this.logger.log('Create user');
    let user = this.userRepository.create();
    user.name = name;
    user.uuid = uuid();
    user.email = email;
    user.password = password;
    user = await this.userRepository.save(user);
    this.logger.log(`User created: ${user.uuid}`);
    return user;
  };

  sessions = async (user: UserEntity) => {
    this.logger.log(`Get sessions for user: ${user.uuid}`);
    const { sessions } = await this.userRepository.findOne({
      where: { uuid: user.uuid },
      relations: { sessions: true },
    });
    this.logger.log(`${sessions.length} sessions found for user: ${user.uuid}`);
    return sessions;
  };

  removeSession = async (user: UserEntity, dto: RemoveSessionDto) => {
    this.logger.log(`Remove session ${dto.session} for user: ${user.uuid}`);
    const sessions = await this.refreshTokenService.removeSession(
      user,
      dto.session,
    );
    this.logger.log(`Session ${dto.session} removed for user: ${user.uuid}`);
    return sessions;
  };

  removeAllSessions = async (user: UserEntity, session: SessionEntity) => {
    this.logger.log(
      `Remove all sessions except current(${session.uuid}) for user: ${user.uuid}`,
    );
    const sessions = await this.refreshTokenService.removeAllSessions(
      user,
      session,
    );
    this.logger.log(
      `All sessions except current(${session.uuid}) removed for user: ${user.uuid}`,
    );
    return sessions;
  };

  sendConfirmEmail = async (user: UserEntity) => {
    this.logger.log(
      `Attempting to send confirmation email for user $${user.uuid}`,
    );
    if (user.emailConfirmed) {
      this.logger.log(`Email already confirmed for user: ${user.uuid}`);
      throw new BadRequestException('Email already confirmed');
    }

    const code = Math.floor(Math.random() * 1000000).toString();
    this.logger.log(`Generated confirmation code for user: ${user.uuid}`);
    await this.cacheManager.set(
      this.emailConfirmationCacheKey(user),
      code,
      1000 * 60 * 60 * 24,
    );
    this.logger.log(
      `Confirmation code generated and persisted for user: ${user.uuid}`,
    );

    this.logger.log(
      `Sending event ${MailEvents['mail.confirm-email']}, user: ${user.uuid}`,
    );
    this.eventEmitter.emit(
      MailEvents['mail.confirm-email'],
      new SendConfirmEmailEvent(user, code),
    );
    this.logger.log(
      `Event ${MailEvents['mail.confirm-email']} sent, user: ${user.uuid}`,
    );
  };

  confirmEmail = async (user: UserEntity, dto: ConfirmEmailDto) => {
    this.logger.log(`Attempting to confirm email for user: ${user.uuid}`);
    const code = await this.cacheManager.get(
      this.emailConfirmationCacheKey(user),
    );
    this.logger.log(
      `Confirmation code retrieved from storage, user: ${user.uuid}`,
    );

    if (code !== dto.code) {
      this.logger.log(`Code mismatch, user: ${user.uuid}`);
      throw new BadRequestException('Invalid confirmation code');
    }

    this.logger.log(`Setting email confirmed for user: ${user.uuid}`);
    user.emailConfirmed = true;
    await this.userRepository.save(user);
    this.logger.log(`Email confirmed for user: ${user.uuid}`);

    await this.cacheManager.del(this.emailConfirmationCacheKey(user));
    this.logger.log(
      `Confirmation code removed from storage, user: ${user.uuid}`,
    );
  };
}
