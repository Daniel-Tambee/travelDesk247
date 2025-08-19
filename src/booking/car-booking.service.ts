import { Injectable, Logger } from '@nestjs/common';
import { CarBooking } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class CarBookingService
  implements ICommon<CarBooking, BaseDto, BaseUpdateDto<CarBooking>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  /**
   * Creates a new car booking record in the database.
   * @param properties The data for the new car booking.
   * @returns A promise that resolves to the created car booking record.
   */
  async create(properties: BaseDto): Promise<CarBooking> {
    try {
      this.logger.log('Creating new car booking', { properties });

      const parsedData = this.parseCarBookingData(properties);

      const carBooking = await this.db.carBooking.create({
        data: {
          ...parsedData,
          pickupDateTime: new Date(parsedData.pickupDateTime),
          dropoffDateTime: new Date(parsedData.dropoffDateTime),
        },
      });

      this.logger.log('Car booking created successfully', {
        carBookingId: carBooking.id,
      });
      return carBooking;
    } catch (error) {
      this.logger.error('Failed to create car booking', { error, properties });
      throw error;
    }
  }

  /**
   * Finds a car booking by its unique ID.
   * @param id The ID of the car booking to find.
   * @returns A promise that resolves to the found car booking, or null if not found.
   */
  async findById(id: string): Promise<CarBooking | null> {
    try {
      this.logger.debug('Finding car booking by ID', { id });

      const carBooking = await this.db.carBooking.findUnique({
        where: { id },
      });

      if (carBooking) {
        this.logger.debug('Car booking found', { carBookingId: id });
      } else {
        this.logger.debug('Car booking not found', { carBookingId: id });
      }

      return carBooking;
    } catch (error) {
      this.logger.error('Failed to find car booking by ID', { error, id });
      throw error;
    }
  }

  /**
   * Finds all car bookings based on the provided options.
   * @param options Pagination, filtering, and sorting options.
   * @returns A promise that resolves to an array of car booking records.
   */
  async findAll(options?: FindAllOptions<CarBooking>): Promise<CarBooking[]> {
    try {
      this.logger.debug('Finding all car bookings', { options });

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

      const carBookings = await this.db.carBooking.findMany(queryOptions);

      this.logger.debug('Car bookings retrieved successfully', {
        count: carBookings.length,
        page: options?.page,
        limit: options?.limit,
      });
      return carBookings;
    } catch (error) {
      this.logger.error('Failed to find all car bookings', { error, options });
      throw error;
    }
  }

  /**
   * Updates an existing car booking by its ID.
   * @param id The ID of the car booking to update.
   * @param properties The data to update.
   * @returns A promise that resolves to the updated car booking.
   */
  async updateById(
    id: string,
    properties: BaseUpdateDto<CarBooking>,
  ): Promise<CarBooking> {
    try {
      this.logger.log('Updating car booking', { id, properties });

      // Check if the car booking exists first
      const existingCarBooking = await this.db.carBooking.findUnique({
        where: { id },
      });

      if (!existingCarBooking) {
        const error = new Error(`Car booking with ID ${id} not found`);
        this.logger.error('Car booking not found for update', { id });
        throw error;
      }

      const parsedData = this.parseCarBookingData(properties);

      const updatedCarBooking = await this.db.carBooking.update({
        where: { id },
        data: {
          ...parsedData,
        },
      });

      this.logger.log('Car booking updated successfully', { carBookingId: id });
      return updatedCarBooking;
    } catch (error) {
      this.logger.error('Failed to update car booking', {
        error,
        id,
        properties,
      });
      throw error;
    }
  }

  /**
   * Deletes a car booking by its unique ID.
   * @param id The ID of the car booking to delete.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting car booking', { id });

      // Check if the car booking exists first
      const existingCarBooking = await this.db.carBooking.findUnique({
        where: { id },
      });

      if (!existingCarBooking) {
        this.logger.warn('Car booking not found for deletion', { id });
        return false;
      }

      await this.db.carBooking.delete({
        where: { id },
      });

      this.logger.log('Car booking deleted successfully', { carBookingId: id });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete car booking', { error, id });
      throw error;
    }
  }

  // --- Utility Methods ---

  /**
   * Helper method to parse incoming data and ensure correct data types.
   * @param data The incoming car booking data.
   * @returns The parsed data.
   */
  private parseCarBookingData(data: any): any {
    const parsed = { ...data };

    // Parse date fields
    if (parsed.pickupDateTime && typeof parsed.pickupDateTime === 'string') {
      parsed.pickupDateTime = new Date(parsed.pickupDateTime);
    }
    if (parsed.dropoffDateTime && typeof parsed.dropoffDateTime === 'string') {
      parsed.dropoffDateTime = new Date(parsed.dropoffDateTime);
    }

    // Parse Decimal fields
    if (
      parsed.dailyRate !== undefined &&
      typeof parsed.dailyRate === 'string'
    ) {
      parsed.dailyRate = new Decimal(parsed.dailyRate);
    }
    if (
      parsed.totalRate !== undefined &&
      typeof parsed.totalRate === 'string'
    ) {
      parsed.totalRate = new Decimal(parsed.totalRate);
    }

    // Handle null values for optional string fields
    if (
      parsed.confirmationNumber === 'null' ||
      parsed.confirmationNumber === ''
    ) {
      parsed.confirmationNumber = null;
    }

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
    if (parsed.vendorCode) {
      parsed.vendorCode = { contains: parsed.vendorCode, mode: 'insensitive' };
    }
    if (parsed.bookingId) {
      parsed.bookingId = { equals: parsed.bookingId };
    }

    return parsed;
  }
}
