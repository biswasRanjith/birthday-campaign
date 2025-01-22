import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CustomerService } from '../customer/customer.service';
import { CampaignService } from '../campaign/campaign.service';
import { EmailService } from '../email/email.service';
import  discounts from '../mock-data/discountCoupon.json';
import { DiscountService } from '../discounts/discount.service';


@Injectable()
export class SchedulerService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly campaignService: CampaignService,
    private readonly emailService: EmailService,
    private readonly discountService: DiscountService
    
  ) {}

  private readonly logger = new Logger(SchedulerService.name)
  

  // @Cron('0 * * * * *')
  // handleCron() {
  //   this.logger.debug('Called every minute');
  // }

  @Cron('0 0 * * *') // Every day at midnight
  async triggerCampaign() {
    this.logger.debug('Triggering campaign');

    // Fetch customers with birthdays in the next 7 days
    const customers = await this.customerService.getCustomersWithUpcomingBirthdays();

    for (const customer of customers) {
      //  Check if a valid birthday coupon exists for this year
      const existingCoupon = await this.discountService.getActiveBirthdayDiscount(customer.id);

      if (existingCoupon) {
        // Send email with the existing coupon
        const recommendations = await this.campaignService.getRecommendations(customer.id);
        await this.emailService.sendBirthdayEmail(customer.email, existingCoupon.code, recommendations);

        this.logger.debug(
          `Email sent to customer ${customer.id} with existing coupon: ${existingCoupon.code}`,
        );
        continue;
      }

      // Generate a new coupon if no valid coupon exists
      const newCouponCode = this.campaignService.generateDiscountCode(customer.id);
      await this.discountService.saveDiscountCode({
        customerId: customer.id,
        code: newCouponCode,
        validFrom: new Date(),
        validTo: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'active',
        type: 'birthday',
      });

      // Send email with the new coupon
      const recommendations = await this.campaignService.getRecommendations(customer.id);
      await this.emailService.sendBirthdayEmail(customer.email, newCouponCode, recommendations);

      this.logger.debug(`Email sent to customer ${customer.id} with new coupon: ${newCouponCode}`);
  }
}
}




