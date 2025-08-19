import { Injectable, Logger } from '@nestjs/common';
import { PackageBooking } from '@prisma/client';
import { JsonValue, Decimal } from '@prisma/client/runtime/library';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class PackageBookingService
  implements ICommon<PackageBooking, BaseDto, BaseUpdateDto<PackageBooking>>
{
  logger: Logger;
  db: DbService;
  create(
    properties: BaseDto,
  ): Promise<{
    id: string;
    bookingId: string;
    packageCode: string;
    packageName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    inclusions: JsonValue;
    totalCost: Decimal;
  }> {
    throw new Error('Method not implemented.');
  }
  findById(
    id: string,
  ): Promise<{
    id: string;
    bookingId: string;
    packageCode: string;
    packageName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    inclusions: JsonValue;
    totalCost: Decimal;
  } | null> {
    throw new Error('Method not implemented.');
  }
  findAll(
    options?:
      | FindAllOptions<{
          id: string;
          bookingId: string;
          packageCode: string;
          packageName: string;
          destination: string;
          startDate: Date;
          endDate: Date;
          inclusions: JsonValue;
          totalCost: Decimal;
        }>
      | undefined,
  ): Promise<
    {
      id: string;
      bookingId: string;
      packageCode: string;
      packageName: string;
      destination: string;
      startDate: Date;
      endDate: Date;
      inclusions: JsonValue;
      totalCost: Decimal;
    }[]
  > {
    throw new Error('Method not implemented.');
  }
  updateById(
    id: string,
    properties: BaseUpdateDto<{
      id: string;
      bookingId: string;
      packageCode: string;
      packageName: string;
      destination: string;
      startDate: Date;
      endDate: Date;
      inclusions: JsonValue;
      totalCost: Decimal;
    }>,
  ): Promise<{
    id: string;
    bookingId: string;
    packageCode: string;
    packageName: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    inclusions: JsonValue;
    totalCost: Decimal;
  }> {
    throw new Error('Method not implemented.');
  }
  deleteById(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
