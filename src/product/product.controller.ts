import { Controller, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from './product.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Get the top products for a user based on their order history.
   * @param userId - ID of the user
   * @returns Array of top products
   */
  @Get('top-products')
  async getTopProducts(@Query('userId') userId: number) {
    // Validate userId
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new BadRequestException('Invalid userId provided. Please provide a valid user ID.');
    }

    try {
      const topProducts = await this.orderService.getTopProducts(userId);

      if (!topProducts || topProducts.length === 0) {
        throw new NotFoundException(`No top products found for userId: ${userId}`);
      }

      return { userId, topProducts };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch top products: ${error.message}`);
    }
  }
}
