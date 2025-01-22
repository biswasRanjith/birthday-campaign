import { Injectable } from '@nestjs/common';
import orders from '../mock-data/orders.json';

@Injectable()
export class OrderService {
  private readonly orders = orders;

  getTopProducts(userId: number): any[] {
    
    const userOrders = [];
    for (const order of this.orders) {
      if (order.userId === Number(userId)) {
        userOrders.push(order);
      }
    }
    
    
    const productCounts: Record<number, { name: string; quantity: number }> = {};
    for (const order of userOrders) {
      for (const item of order.items) {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.name, quantity: 0 };
        }
        productCounts[item.productId].quantity += item.quantity;
      }
    }

    
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    return topProducts;
  }
}