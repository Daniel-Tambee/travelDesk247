import { FlightBooking } from '@prisma/client';

export class SearchDto {
  field?: keyof FlightBooking;
  value?: string;
}
