import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DbService } from 'src/db/db.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService,DbService,Logger],
  controllers: [AuthController]
})
export class AuthModule {}
