import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailProcessor } from './processors';
import { MailerConfigService } from './services';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MailerModule.forRootAsync({ useClass: MailerConfigService }),
    BullModule.registerQueue({
      name: 'mailer',
    }),
  ],
  providers: [MailProcessor],
})
export class MailModule {}
