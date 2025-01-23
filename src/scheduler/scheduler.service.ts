import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CustomerService } from '../customer/customer.service';
import { CampaignService } from '../campaign/campaign.service';
import { EmailService } from '../email/email.service';
import { DiscountService } from '../discounts/discount.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly customerService: CustomerService,
    private readonly campaignService: CampaignService,
    private readonly emailService: EmailService,
    private readonly discountService: DiscountService
  ) {}

  @Cron('0 0 * * *')// Every day at midnight
  async triggerCampaign() {
    this.logger.debug('Triggering campaign');

    // Fetch customers with birthdays in the next 7 days
    const customers = await this.customerService.getCustomersWithUpcomingBirthdays();

    for (const customer of customers) {
      // Check if a valid birthday coupon exists for this year
      const existingCoupon = await this.discountService.getActiveBirthdayDiscount(customer.id);

      if (existingCoupon) {
        // Send email with the existing coupon
        const recommendations = await this.campaignService.getRecommendations(customer.id);
        const recommendationNames = recommendations.map(rec => rec['name']);
        await this.emailService.sendBirthdayEmail(customer.email, existingCoupon.code, recommendationNames);

        this.logger.debug(
          `Email sent to customer ${customer.id} with existing coupon: ${existingCoupon.code}`,
        );
        continue;
      }

      // Generate a new coupon if no valid coupon exists
      const usedCodesCount = await this.discountService.getUsedCodesCount(customer.id);
      const newCouponCode = this.discountService.generateDiscountCode(customer.id, usedCodesCount);
      await this.discountService.saveDiscountCode({
        customerId: customer.id,
        customerEmail: customer.email,
        code: newCouponCode,
        validFrom: new Date(),
        validTo: new Date(new Date().setDate(new Date().getDate() + 2)), // 48 hours validity
        status: 'active',
        type: 'birthday',
      });

      // Send email with the new coupon
      const recommendations = await this.campaignService.getRecommendations(customer.id);
      const recommendationNames = recommendations.map(rec => rec['name']);
      await this.emailService.sendBirthdayEmail(customer.email, newCouponCode, recommendationNames);

      this.logger.debug(`Email sent to customer ${customer.id} with new coupon: ${newCouponCode}`);
    }
  }

  @Cron('0 12 * * *') // Every day at 12 PM
  async sendReminders() {
    this.logger.debug('Sending reminder emails');

    // Fetch all active discounts
    const discounts = await this.discountService.getAllActiveDiscounts();

    const now = new Date();
    const reminderTime = new Date(now.setDate(now.getDate() + 1)); // 24 hours before expiration

    for (const discount of discounts) {
      const validTo = new Date(discount.validTo);
      if (validTo <= reminderTime && validTo > now) {
        const timeLeft = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60)) + ' hours';
        await this.emailService.sendReminderEmail(discount.customerEmail, discount.code, timeLeft);

        this.logger.debug(`Reminder email sent to ${discount.customerEmail} for discount code ${discount.code}`);
      }
    }
  }
}




