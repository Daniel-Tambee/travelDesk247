import { Logger, Module } from '@nestjs/common';
import { TravellerProfileService } from './traveller-profile.service';
import { DbService } from 'src/db/db.service';
import { TravellerProfileController } from './traveller-profile.controller';

@Module({
  providers: [TravellerProfileService, DbService, Logger],
  controllers: [TravellerProfileController],
})
export class TravellerProfileModule {}
