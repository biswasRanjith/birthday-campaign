import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('upcoming-birthdays')
  async getCustomersWithUpcomingBirthdays() {
    try {
      const customers = await this.customerService.getCustomersWithUpcomingBirthdays();

      if (!customers || customers.length === 0) {
        throw new HttpException('No customers with upcoming birthdays found', HttpStatus.NOT_FOUND);
      }

      return { data: customers };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch customers with upcoming birthdays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
