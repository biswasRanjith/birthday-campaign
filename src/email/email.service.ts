import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendBirthdayEmail(to: string, discountCode: string, recommendations: string[]) {
    await this.mailerService.sendMail({
      to,
      subject: 'Happy Birthday! Enjoy your discount',
      template: './birthday', // The template file name
      context: { // Data to be sent to template engine
        discountCode,
        recommendations,
      },
    });
    this.logger.log(`Birthday email sent to ${to} with discount code ${discountCode}`);
  }

  async sendReminderEmail(to: string, discountCode: string, timeLeft: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Reminder: Your Birthday Discount is Expiring Soon!',
      template: './reminder', // The template file name
      context: { // Data to be sent to template engine
        discountCode,
        timeLeft,
      },
    });
    this.logger.log(`Reminder email sent to ${to} with discount code ${discountCode}`);
  }
}
