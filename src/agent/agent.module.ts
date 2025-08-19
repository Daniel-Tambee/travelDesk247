import { Logger, Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { DbService } from 'src/db/db.service';
import { AgentController } from './agent.controller';

@Module({
  providers: [AgentService, DbService, Logger],
  controllers: [AgentController],
})
export class AgentModule {}
