import { Logger, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { DbService } from 'src/db/db.service';

@Module({
  providers: [SessionService, Logger, DbService],
})
export class SessionModule {}
