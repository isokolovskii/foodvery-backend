import { Inject, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { SendConfirmationEmailDto } from '../../api/auth/dto';

@Processor('mailer')
export class MailProcessor {
  @Inject(MailerService)
  private readonly mailerService: MailerService;

  private readonly logger = new Logger(MailProcessor.name);

  @Process('confirmation')
  async sendUserConfirmation(job: Job<SendConfirmationEmailDto>) {
    const { email, code } = job.data;
    this.logger.log('Sending confirmation email to user');
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to FoodVery!',
      template: './confirmation',
      context: {
        code,
      },
    });
    this.logger.log('Confirmation email sent to user');
  }
}
