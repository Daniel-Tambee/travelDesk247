import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { SessionModule } from './session/session.module';
import { TravellerProfileModule } from './traveller-profile/traveller-profile.module';
import { AgentModule } from './agent/agent.module';
import { CompanyModule } from './company/company.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    AuthModule,
    OtpModule,
    SessionModule,
    TravellerProfileModule,
    AgentModule,
    CompanyModule,
    BookingModule,
    PaymentModule,
    DbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
