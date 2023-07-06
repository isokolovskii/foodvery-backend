import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigService } from './mailer.config';
import { MailService } from './mail.service';

@Module({
  imports: [MailerModule.forRootAsync({ useClass: MailerConfigService })],
  providers: [MailService],
})
export class MailModule {}
