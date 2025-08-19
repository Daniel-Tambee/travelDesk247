import { Logger, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { DbService } from 'src/db/db.service';
import { CompanyController } from './company.controller';

@Module({
  providers: [CompanyService,DbService, Logger],
  controllers: [CompanyController]
})
export class CompanyModule {}
