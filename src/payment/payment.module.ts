import { Logger, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { DbService } from 'src/db/db.service';

@Module({
  providers: [PaymentService,DbService, Logger]
})
export class PaymentModule {}
