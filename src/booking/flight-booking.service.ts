import { Injectable, Logger, Query } from '@nestjs/common';
import { FlightBooking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class FlightBookingService
  implements ICommon<FlightBooking, BaseDto, BaseUpdateDto<FlightBooking>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  /**
   * Creates a new flight booking record in the database.
   * @param properties The data for the new flight booking.
   * @returns A promise that resolves to the created flight booking record.
   */
  async create(properties: BaseDto): Promise<FlightBooking> {
    try {
      this.logger.log('Creating new flight booking', { properties });

      const parsedData = this.parseFlightBookingData(properties);

      const flightBooking = await this.db.flightBooking.create({
        data: {
          ...parsedData,
          departureTime: new Date(parsedData.departureTime),
          arrivalTime: new Date(parsedData.arrivalTime),
        },
      });

      this.logger.log('Flight booking created successfully', {
        flightBookingId: flightBooking.id,
      });
      return flightBooking;
    } catch (error) {
      this.logger.error('Failed to create flight booking', {
        error,
        properties,
      });
      throw error;
    }
  }

  /**
   * Finds a flight booking by its unique ID.
   * @param id The ID of the flight booking to find.
   * @returns A promise that resolves to the found flight booking, or null if not found.
   */
  async findById(id: string): Promise<FlightBooking | null> {
    try {
      this.logger.debug('Finding flight booking by ID', { id });

      const flightBooking = await this.db.flightBooking.findUnique({
        where: { id },
      });

      if (flightBooking) {
        this.logger.debug('Flight booking found', { flightBookingId: id });
      } else {
        this.logger.debug('Flight booking not found', { flightBookingId: id });
      }

      return flightBooking;
    } catch (error) {
      this.logger.error('Failed to find flight booking by ID', { error, id });
      throw error;
    }
  }

  /**
   * Finds all flight bookings based on the provided options.
   * @param options Pagination, filtering, and sorting options.
   * @returns A promise that resolves to an array of flight booking records.
   */
  async findAll(
    options?: FindAllOptions<FlightBooking>,
  ): Promise<FlightBooking[]> {
    try {
      this.logger.debug('Finding all flight bookings', { options });

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
        queryOptions.where = options.filters;
        console.log(queryOptions.where);
      }

      // Handle sorting
      if (options?.sort) {
        queryOptions.orderBy = {
          [options.sort.field]: options.sort.order,
        };
      }
      console.log(queryOptions.filter);

      const flightBookings = await this.db.flightBooking.findMany(queryOptions);

      this.logger.debug('Flight bookings retrieved successfully', {
        count: flightBookings.length,
        page: options?.page,
        limit: options?.limit,
      });
      return flightBookings;
    } catch (error) {
      this.logger.error('Failed to find all flight bookings', {
        error,
        options,
      });
      throw error;
    }
  }

  /**
   * Updates an existing flight booking by its ID.
   * @param id The ID of the flight booking to update.
   * @param properties The data to update.
   * @returns A promise that resolves to the updated flight booking.
   */
  async updateById(
    id: string,
    properties: BaseUpdateDto<FlightBooking>,
  ): Promise<FlightBooking> {
    try {
      this.logger.log('Updating flight booking', { id, properties });

      // Check if the flight booking exists first
      const existingFlightBooking = await this.db.flightBooking.findUnique({
        where: { id },
      });

      if (!existingFlightBooking) {
        const error = new Error(`Flight booking with ID ${id} not found`);
        this.logger.error('Flight booking not found for update', { id });
        throw error;
      }

      const parsedData = this.parseFlightBookingData(properties);

      const updatedFlightBooking = await this.db.flightBooking.update({
        where: { id },
        data: {
          ...parsedData,
        },
      });

      this.logger.log('Flight booking updated successfully', {
        flightBookingId: id,
      });
      return updatedFlightBooking;
    } catch (error) {
      this.logger.error('Failed to update flight booking', {
        error,
        id,
        properties,
      });
      throw error;
    }
  }

  /**
   * Deletes a flight booking by its unique ID.
   * @param id The ID of the flight booking to delete.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting flight booking', { id });

      // Check if the flight booking exists first
      const existingFlightBooking = await this.db.flightBooking.findUnique({
        where: { id },
      });

      if (!existingFlightBooking) {
        this.logger.warn('Flight booking not found for deletion', { id });
        return false;
      }

      await this.db.flightBooking.delete({
        where: { id },
      });

      this.logger.log('Flight booking deleted successfully', {
        flightBookingId: id,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete flight booking', { error, id });
      throw error;
    }
  }

  // --- Utility Methods ---

  /**
   * Helper method to parse incoming data and ensure correct data types.
   * @param data The incoming flight booking data.
   * @returns The parsed data.
   */
  private parseFlightBookingData(data: any): any {
    const parsed = { ...data };

    // Parse date fields
    if (parsed.departureTime && typeof parsed.departureTime === 'string') {
      parsed.departureTime = new Date(parsed.departureTime);
    }
    if (parsed.arrivalTime && typeof parsed.arrivalTime === 'string') {
      parsed.arrivalTime = new Date(parsed.arrivalTime);
    }

    // Parse Decimal fields
    const decimalFields = ['fare', 'taxes', 'totalFare'];
    decimalFields.forEach((field) => {
      if (parsed[field] !== undefined && typeof parsed[field] === 'string') {
        parsed[field] = new Decimal(parsed[field]);
      }
    });

    // Parse JSON fields
    const jsonFields = ['seatNumbers', 'baggage'];
    jsonFields.forEach((field) => {
      if (parsed[field] !== undefined && typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (error) {
          this.logger.warn(`Failed to parse ${field} JSON`, {
            error,
            data: parsed[field],
          });
          parsed[field] = {};
        }
      }
    });

    // Handle null values for optional string fields
    if (parsed.ticketNumber === 'null' || parsed.ticketNumber === '') {
      parsed.ticketNumber = null;
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
    const stringFilters = [
      'bookingId',
      'airlineCode',
      'flightNumber',
      'departure',
      'arrival',
      'cabin',
    ];
    stringFilters.forEach((field) => {
      if (parsed[field]) {
        parsed[field] = { contains: parsed[field], mode: 'insensitive' };
      }
    });

    // Handle date filters for range queries
    if (
      parsed.departureTimeFrom &&
      typeof parsed.departureTimeFrom === 'string'
    ) {
      if (!parsed.departureTime) parsed.departureTime = {};
      parsed.departureTime.gte = new Date(parsed.departureTimeFrom);
      delete parsed.departureTimeFrom;
    }
    if (parsed.departureTimeTo && typeof parsed.departureTimeTo === 'string') {
      if (!parsed.departureTime) parsed.departureTime = {};
      parsed.departureTime.lte = new Date(parsed.departureTimeTo);
      delete parsed.departureTimeTo;
    }

    return parsed;
  }
}
