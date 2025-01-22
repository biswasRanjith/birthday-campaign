import { Injectable, Logger } from '@nestjs/common';
import discounts from '../mock-data/discountCoupon.json';

@Injectable()
export class DiscountService {
  private readonly discounts = discounts;
  private readonly logger = new Logger(DiscountService.name);

 
  async getActiveBirthdayDiscount(customerId: number): Promise<any | null> {
    if (!customerId || customerId <= 0) {
      this.logger.error(`Invalid customerId: ${customerId}`);
      throw new Error('Invalid customer ID.');
    }

    if (!Array.isArray(this.discounts)) {
      this.logger.error('Discount data is not loaded or invalid.');
      return null;
    }

    const today = new Date().toISOString().split('T')[0];

    return this.discounts.find(
      (discount) =>
        discount.customerId === customerId &&
        discount.type === 'birthday' &&
        discount.validFrom <= today &&
        discount.validTo >= today &&
        (discount.status === 'active' || discount.status === 'redeemed'),
    );
  }

  
  async saveDiscountCode(discount: {
    customerId: number;
    code: string;
    validFrom: Date;
    validTo: Date;
    status: string;
    type: string;
  }): Promise<void> {
    // Validate input fields
    if (!discount.customerId || discount.customerId <= 0) {
      this.logger.error('Invalid customerId provided.');
      throw new Error('Invalid customer ID.');
    }

    if (!discount.code) {
      this.logger.error('Discount code is missing.');
      throw new Error('Discount code cannot be empty.');
    }

    if (!['active', 'redeemed', 'expired'].includes(discount.status)) {
      this.logger.error(`Invalid discount status: ${discount.status}`);
      throw new Error('Invalid discount status.');
    }

    if (!discount.type) {
      this.logger.error('Discount type is missing.');
      throw new Error('Discount type cannot be empty.');
    }

    if (isNaN(discount.validFrom.getTime()) || isNaN(discount.validTo.getTime())) {
      this.logger.error('Invalid date provided for validFrom or validTo.');
      throw new Error('ValidFrom and ValidTo must be valid dates.');
    }

    // Check for duplicate discounts
    const existingDiscount = this.discounts.find(
      (d) =>
        d.customerId === discount.customerId &&
        d.type === discount.type &&
        d.validFrom === discount.validFrom.toISOString() &&
        d.validTo === discount.validTo.toISOString(),
    );

    if (existingDiscount) {
      this.logger.warn(
        `Duplicate discount for customerId ${discount.customerId} and type ${discount.type}.`,
      );
      return; 
    }

    // Save the new discount
    const newDiscount = {
      couponId: Date.now(), 
      customerId: discount.customerId,
      code: discount.code,
      validFrom: discount.validFrom.toISOString(), 
      validTo: discount.validTo.toISOString(),
      status: discount.status,
      type: discount.type,
    };

    this.discounts.push(newDiscount);
    this.logger.log('Saved new discount:', newDiscount);
  }
}
