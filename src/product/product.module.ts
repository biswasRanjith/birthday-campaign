import { Module } from '@nestjs/common';
import { OrderService } from './product.service';
import { OrderController } from './product.controller';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
})
export class ProductModule {}

