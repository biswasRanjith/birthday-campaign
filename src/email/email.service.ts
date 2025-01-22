import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Sends a birthday email with a discount code and product recommendations.
   * @param to - Recipient's email address
   * @param discountCode - The discount code for the recipient
   * @param recommendations - List of recommended products
   */
  async sendBirthdayEmail(to: string, discountCode: string, recommendations: string[]) {
    // Input Validation
    if (!to || !this.isValidEmail(to)) {
      this.logger.error(`Invalid email address provided: ${to}`);
      throw new Error('Invalid email address.');
    }

    if (!discountCode) {
      this.logger.error('Discount code is missing.');
      throw new Error('Discount code cannot be empty.');
    }

    if (!recommendations || !Array.isArray(recommendations)) {
      this.logger.warn('Recommendations are missing or invalid. Providing a fallback message.');
      recommendations = ['Check out our latest products and offers!'];
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Happy Birthday! Enjoy your discount',
        template: './birthday',
        context: {
          discountCode,
          recommendations,
        },
      });

      this.logger.log(`Birthday email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error('Failed to send the birthday email.');
    }
  }

  /**
   * Validates the format of an email address.
   * @param email - The email address to validate
   * @returns True if the email is valid, false otherwise
   */
  private isValidEmail(email: string): boolean {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
