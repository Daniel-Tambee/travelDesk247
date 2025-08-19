import { Logger, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { DbService } from 'src/db/db.service';
import { OtpController } from './otp.controller';

@Module({
  providers: [OtpService,DbService, Logger],
  controllers: [OtpController]
})
export class OtpModule {}
