import { Injectable, Logger } from '@nestjs/common';
import customers from '../mock-data/customer.json';

@Injectable()
export class CustomerService {
  private readonly customers = customers;
  private readonly logger = new Logger(CustomerService.name);

  /**
   * Get customers with birthdays in the next 7 days.
   * @returns An array of customers with upcoming birthdays
   */
  getCustomersWithUpcomingBirthdays(): any[] {
    if (!this.customers || !Array.isArray(this.customers)) {
      this.logger.warn('Customers data is not loaded or invalid.');
      return [];
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingBirthdays = this.customers.filter((customer) => {
      if (!customer.birthday) {
        this.logger.warn(`Customer ID ${customer.id} is missing a birthday field.`);
        return false;
      }

      const birthday = new Date(customer.birthday);

      if (isNaN(birthday.getTime())) {
        this.logger.warn(
          `Customer ID ${customer.id} has an invalid birthday format: ${customer.birthday}`,
        );
        return false;
      }

      birthday.setFullYear(today.getFullYear()); // Adjust year for comparison
      return birthday >= today && birthday <= nextWeek;
    });

    if (upcomingBirthdays.length === 0) {
      this.logger.debug('No customers with upcoming birthdays in the next 7 days.');
    }

    return upcomingBirthdays;
  }
}
