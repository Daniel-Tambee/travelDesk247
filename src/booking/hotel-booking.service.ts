import { Injectable, Logger } from '@nestjs/common';
import { HotelBooking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class HotelBookingService
  implements ICommon<HotelBooking, BaseDto, BaseUpdateDto<HotelBooking>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  /**
   * Creates a new hotel booking record in the database.
   * @param properties The data for the new hotel booking.
   * @returns A promise that resolves to the created hotel booking record.
   */
  async create(properties: BaseDto): Promise<HotelBooking> {
    try {
      this.logger.log('Creating new hotel booking', { properties });

      const parsedData = this.parseHotelBookingData(properties);

      const hotelBooking = await this.db.hotelBooking.create({
        data: {
          ...parsedData,
          checkIn: new Date(parsedData.checkIn),
          checkOut: new Date(parsedData.checkOut),
        },
      });

      this.logger.log('Hotel booking created successfully', {
        hotelBookingId: hotelBooking.id,
      });
      return hotelBooking;
    } catch (error) {
      this.logger.error('Failed to create hotel booking', {
        error,
        properties,
      });
      throw error;
    }
  }

  /**
   * Finds a hotel booking by its unique ID.
   * @param id The ID of the hotel booking to find.
   * @returns A promise that resolves to the found hotel booking, or null if not found.
   */
  async findById(id: string): Promise<HotelBooking | null> {
    try {
      this.logger.debug('Finding hotel booking by ID', { id });

      const hotelBooking = await this.db.hotelBooking.findUnique({
        where: { id },
      });

      if (hotelBooking) {
        this.logger.debug('Hotel booking found', { hotelBookingId: id });
      } else {
        this.logger.debug('Hotel booking not found', { hotelBookingId: id });
      }

      return hotelBooking;
    } catch (error) {
      this.logger.error('Failed to find hotel booking by ID', { error, id });
      throw error;
    }
  }

  /**
   * Finds all hotel bookings based on the provided options.
   * @param options Pagination, filtering, and sorting options.
   * @returns A promise that resolves to an array of hotel booking records.
   */
  async findAll(
    options?: FindAllOptions<HotelBooking>,
  ): Promise<HotelBooking[]> {
    try {
      this.logger.debug('Finding all hotel bookings', { options });

      const queryOptions: any = {};

      // Handle pagination
      if (options?.page && options?.limit) {
        queryOptions.skip = (options.page - 1) * options.limit;
        queryOptions.take = options.limit;
      } else if (options?.limit) {
        queryOptions.take = options.limit;
      }

      // Handle filters with parsing
      if (options?.filters) {
        queryOptions.where = this.parseFilters(options.filters);
      }

      // Handle sorting
      if (options?.sort) {
        queryOptions.orderBy = {
          [options.sort.field]: options.sort.order,
        };
      }

      const hotelBookings = await this.db.hotelBooking.findMany(queryOptions);

      this.logger.debug('Hotel bookings retrieved successfully', {
        count: hotelBookings.length,
        page: options?.page,
        limit: options?.limit,
      });
      return hotelBookings;
    } catch (error) {
      this.logger.error('Failed to find all hotel bookings', {
        error,
        options,
      });
      throw error;
    }
  }

  /**
   * Updates an existing hotel booking by its ID.
   * @param id The ID of the hotel booking to update.
   * @param properties The data to update.
   * @returns A promise that resolves to the updated hotel booking.
   */
  async updateById(
    id: string,
    properties: BaseUpdateDto<HotelBooking>,
  ): Promise<HotelBooking> {
    try {
      this.logger.log('Updating hotel booking', { id, properties });

      // Check if the hotel booking exists first
      const existingHotelBooking = await this.db.hotelBooking.findUnique({
        where: { id },
      });

      if (!existingHotelBooking) {
        const error = new Error(`Hotel booking with ID ${id} not found`);
        this.logger.error('Hotel booking not found for update', { id });
        throw error;
      }

      const parsedData = this.parseHotelBookingData(properties);

      const updatedHotelBooking = await this.db.hotelBooking.update({
        where: { id },
        data: {
          ...parsedData,
        },
      });

      this.logger.log('Hotel booking updated successfully', {
        hotelBookingId: id,
      });
      return updatedHotelBooking;
    } catch (error) {
      this.logger.error('Failed to update hotel booking', {
        error,
        id,
        properties,
      });
      throw error;
    }
  }

  /**
   * Deletes a hotel booking by its unique ID.
   * @param id The ID of the hotel booking to delete.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting hotel booking', { id });

      // Check if the hotel booking exists first
      const existingHotelBooking = await this.db.hotelBooking.findUnique({
        where: { id },
      });

      if (!existingHotelBooking) {
        this.logger.warn('Hotel booking not found for deletion', { id });
        return false;
      }

      await this.db.hotelBooking.delete({
        where: { id },
      });

      this.logger.log('Hotel booking deleted successfully', {
        hotelBookingId: id,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete hotel booking', { error, id });
      throw error;
    }
  }

  // --- Utility Methods ---

  /**
   * Helper method to parse incoming data and ensure correct data types.
   * @param data The incoming hotel booking data.
   * @returns The parsed data.
   */
  private parseHotelBookingData(data: any): any {
    const parsed = { ...data };

    // Parse date fields
    if (parsed.checkIn && typeof parsed.checkIn === 'string') {
      parsed.checkIn = new Date(parsed.checkIn);
    }
    if (parsed.checkOut && typeof parsed.checkOut === 'string') {
      parsed.checkOut = new Date(parsed.checkOut);
    }

    // Parse Decimal fields
    const decimalFields = ['ratePerNight', 'totalRate', 'taxes'];
    decimalFields.forEach((field) => {
      if (parsed[field] !== undefined && typeof parsed[field] === 'string') {
        parsed[field] = new Decimal(parsed[field]);
      }
    });

    // Parse number fields
    if (
      parsed.numberOfRooms !== undefined &&
      typeof parsed.numberOfRooms === 'string'
    ) {
      parsed.numberOfRooms = parseInt(parsed.numberOfRooms, 10);
    }

    // Handle null values for optional string fields
    const optionalStringFields = ['confirmationNumber', 'specialRequests'];
    optionalStringFields.forEach((field) => {
      if (parsed[field] === 'null' || parsed[field] === '') {
        parsed[field] = null;
      }
    });

    return parsed;
  }

  /**
   * Helper method to parse filters and convert them to the correct types for the database.
   * @param filters The filters object.
   * @returns The parsed filters object.
   */
  private parseFilters(filters: any): any {
    const parsed = { ...filters };

    // Handle string filters
    const stringFilters = ['bookingId', 'hotelCode', 'hotelName', 'roomType'];
    stringFilters.forEach((field) => {
      if (parsed[field]) {
        parsed[field] = { contains: parsed[field], mode: 'insensitive' };
      }
    });

    // Handle date filters for range queries
    if (parsed.checkInFrom && typeof parsed.checkInFrom === 'string') {
      if (!parsed.checkIn) parsed.checkIn = {};
      parsed.checkIn.gte = new Date(parsed.checkInFrom);
      delete parsed.checkInFrom;
    }
    if (parsed.checkInTo && typeof parsed.checkInTo === 'string') {
      if (!parsed.checkIn) parsed.checkIn = {};
      parsed.checkIn.lte = new Date(parsed.checkInTo);
      delete parsed.checkInTo;
    }

    return parsed;
  }
}
