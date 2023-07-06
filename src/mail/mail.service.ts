import { Inject, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendConfirmEmailEvent } from './events/send-confirm-email.event';
import { OnEvent } from '@nestjs/event-emitter';
import { MailEvents } from './mail.events';
@Injectable()
export class MailService {
  @Inject(MailerService)
  private readonly mailerService: MailerService;

  private readonly logger = new Logger(MailService.name);

  @OnEvent(MailEvents['mail.confirm-email'], { async: true })
  async sendUserConfirmation({ user, code }: SendConfirmEmailEvent) {
    this.logger.log('Sending confirmation email to user', user.uuid);
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to FoodVery!',
      template: './confirmation',
      context: {
        name: user.name,
        code,
      },
    });
    this.logger.log('Confirmation email sent to user', user.uuid);
  }
}
