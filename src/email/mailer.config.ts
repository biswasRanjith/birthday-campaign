import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

export const mailerConfig = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.get<string>('EMAIL_HOST'),
    port: 587,
    secure: false,
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASSWORD'),
    },
  },
  defaults: {
    from: '"No Reply" <no-reply@example.com>',
  },
  template: {
    dir: path.join(__dirname, '../templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
