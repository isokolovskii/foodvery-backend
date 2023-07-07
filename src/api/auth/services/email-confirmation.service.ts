import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bull';
import type { Cache } from 'cache-manager';

import { SendConfirmationEmailDto, ConfirmEmailDto } from '../dto';
import type { UserEntity } from '../entities';

@Injectable()
export class EmailConfirmationService {
  private readonly logger = new Logger(EmailConfirmationService.name);
  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache;
  @Inject(ConfigService) private readonly configService: ConfigService;

  private get confirmationCodeLength(): number {
    return this.configService.get<number>('CONFIRMATION_CODE_LENGTH');
  }

  private emailConfirmationCacheKey = (userUUID: UserEntity['uuid']) =>
    `email-confirmation:${userUUID}`;

  private async generateConfirmationCode(
    userUUID: UserEntity['uuid'],
  ): Promise<string> {
    const code = Math.floor(
      Math.random() * Math.pow(10, this.confirmationCodeLength),
    ).toString();
    await this.cacheManager.set(this.emailConfirmationCacheKey(userUUID), code);
    return code;
  }

  public async sendConfirmationEmail({ uuid, email }: UserEntity) {
    const code = await this.generateConfirmationCode(uuid);

    this.logger.log(`Queing to send confirmation email to user ${uuid}`);

    try {
      await this.emailConfirmationQueue.add(
        'confirmation',
        new SendConfirmationEmailDto({ email, code }),
      );
      this.logger.log(`Task to send confirmation email to user ${uuid} queued`);
    } catch (error) {
      this.logger.error(`Error sending confirmation email to user ${uuid}`);
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  public async validateConfirmationCode(
    { code }: ConfirmEmailDto,
    userUUID: UserEntity['uuid'],
  ) {
    const cachedCode = await this.cacheManager.get(
      this.emailConfirmationCacheKey(userUUID),
    );

    return cachedCode === code;
  }

  constructor(
    @InjectQueue('mailer')
    private readonly emailConfirmationQueue: Queue<SendConfirmationEmailDto>,
  ) {}
}
