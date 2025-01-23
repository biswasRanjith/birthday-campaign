import { Injectable, Logger } from '@nestjs/common';
import discounts from '../mock-data/discountCoupon.json';

@Injectable()
export class DiscountService {
  private readonly logger = new Logger(DiscountService.name);
  private readonly discountPercentages = [60, 50, 40, 30, 20, 10]; // Decreasing percentages
 
  private readonly discounts = discounts;

  async getActiveBirthdayDiscount(customerId: string): Promise<any | null> {
    if (!customerId) {
      this.logger.error('Invalid customerId');
      return null;
    }

    const today = new Date().toISOString().split('T')[0];

    return this.discounts.find(
      (discount) =>
        discount.customerId === Number(customerId) &&
        discount.type === 'birthday' &&
        discount.validFrom <= today &&
        discount.validTo >= today &&
        (discount.status === 'active'),
    ) || null;
  }

  async getUsedCodesCount(customerId: string): Promise<number> {
    if (!customerId) {
      this.logger.error('Invalid customerId');
      return 0;
    }

    return this.discounts.filter(
      discount => discount.customerId === Number(customerId) && discount.type === 'birthday',
    ).length;
  }

  async saveDiscountCode(discount: any): Promise<void> {
    if (!discount || !discount.customerId || !discount.customerEmail || !discount.code || !discount.validFrom || !discount.validTo || !discount.status || !discount.type) {
      this.logger.error('Invalid discount object');
      return;
    }

    const newDiscount = {
      couponId: Date.now(),
      customerId: discount.customerId,
      customerEmail: discount.customerEmail,
      code: discount.code,
      validFrom: discount.validFrom.toISOString(),
      validTo: discount.validTo.toISOString(),
      status: discount.status,
      type: discount.type,
    };

    this.discounts.push(newDiscount);
    this.logger.log('Saved new discount:', newDiscount);
  }

  async getAllActiveDiscounts(): Promise<any[]> {
    const now = new Date();
    return this.discounts.filter(
      discount => new Date(discount.validTo) > now && discount.status === 'active',
    );
  }

  generateDiscountCode(customerId: string, usedCodesCount: number): string {
    if (!customerId) {
      this.logger.error('Invalid customerId');
      return '';
    }

    if (usedCodesCount < 0 || usedCodesCount >= this.discountPercentages.length) {
      this.logger.error('Invalid usedCodesCount');
      usedCodesCount = 60-usedCodesCount*10
    }

    const percentage = this.discountPercentages[usedCodesCount];
    return `BDAY-${customerId}-${percentage}-${Date.now()}`;
  }
}
