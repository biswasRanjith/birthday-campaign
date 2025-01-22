import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './email/mailer.config';
import { CustomerModule } from './customer/customer.module';
import { ProductModule } from './product/product.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler/scheduler.service';
import { CustomerService } from './customer/customer.service';
import { CampaignService } from './campaign/campaign.service';
import { EmailService } from './email/email.service';
import { OrderService } from './product/product.service';
import { DiscountService } from './discounts/discount.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => mailerConfig(configService),
      inject: [ConfigService],
    }),
    CustomerModule,
    ProductModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SchedulerService,
    CustomerService,
    CampaignService,
    EmailService,
    OrderService,
    DiscountService,
  ],
})
export class AppModule {}
