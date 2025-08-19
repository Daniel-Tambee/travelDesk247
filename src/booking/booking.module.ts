import { Logger, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { DbService } from 'src/db/db.service';
import { FlightBookingService } from './flight-booking.service';
import { CarBookingService } from './car-booking.service';
import { HotelBookingService } from './hotel-booking.service';
import { BookingController } from './booking.controller';
import { CarBookingController } from './car-booking.controller';
import { FlightBookingController } from './flight-booking.controller';
import { HotelBookingController } from './hotel-booking.controller';
import { PackageBookingController } from './package-booking.controller';
import { PackageBookingService } from './package-booking.service';

@Module({
  providers: [
    BookingService,
    DbService,
    Logger,
    FlightBookingService,
    CarBookingService,
    HotelBookingService,
    PackageBookingService,
  ],
  controllers: [
    BookingController,
    CarBookingController,
    FlightBookingController,
    HotelBookingController,
    PackageBookingController,
  ],
})
export class BookingModule {}
