import { Injectable, Logger } from '@nestjs/common';
import { OrderService } from '../product/product.service';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly productService: OrderService) {}

  /**
   * Generate a unique discount code for the user.
   * @param userId - ID of the user
   * @returns A unique discount code string
   */
  generateDiscountCode(userId: number): string {
    if (!userId || userId <= 0) {
      this.logger.error(`Invalid userId provided: ${userId}`);
      throw new Error('Invalid user ID for discount code generation.');
    }

    return `BDAY-${userId}-${Date.now()}`;
  }

  /**
   * Get product recommendations for the user based on their order history.
   * @param userId - ID of the user
   * @returns An array of recommended products
   */
  async getRecommendations(userId: number): Promise<string[]> {
    if (!userId || userId <= 0) {
      this.logger.error(`Invalid userId provided: ${userId}`);
      throw new Error('Invalid user ID for fetching recommendations.');
    }

    try {
      const recommendations = await this.productService.getTopProducts(userId);

      if (!recommendations || recommendations.length === 0) {
        this.logger.warn(`No recommendations found for userId: ${userId}`);
        return ['No recommendations available. Check back later!'];
      }

      return recommendations;
    } catch (error) {
      this.logger.error(
        `Error fetching recommendations for userId ${userId}: ${error.message}`,
      );
      throw new Error('Failed to fetch product recommendations.');
    }
  }
}
