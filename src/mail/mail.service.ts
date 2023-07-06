import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendConfirmEmailEvent } from './events/send-confirm-email.event';
import { OnEvent } from '@nestjs/event-emitter';
import { MailEvents } from './mail.events';

@Injectable()
export class MailService {
  @Inject(MailerService)
  private readonly mailerService: MailerService;

  @OnEvent(MailEvents['mail.confirm-email'], { async: true })
  async sendUserConfirmation({ user, code }: SendConfirmEmailEvent) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to FoodVery!',
      template: './confirmation',
      context: {
        name: user.name,
        code,
      },
    });
  }
}
