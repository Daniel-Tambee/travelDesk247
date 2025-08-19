import { Injectable, Logger } from '@nestjs/common';
import { $Enums, Booking } from '@prisma/client';
import { Decimal, JsonValue } from '@prisma/client/runtime/library';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class BookingService
  implements ICommon<Booking, BaseDto, BaseUpdateDto<Booking>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  async create(properties: BaseDto): Promise<{
    id: string;
    bookingRef: string;
    pnr: string | null;
    userId: string;
    profileId: string | null;
    agentId: string | null;
    companyId: string | null;
    status: $Enums.BookingStatus;
    totalAmount: Decimal;
    currency: string;
    bookingType: $Enums.BookingType;
    travelDate: Date | null;
    returnDate: Date | null;
    passengers: JsonValue;
    costCenter: string | null;
    projectCode: string | null;
    reasonCode: string | null;
    approvalStatus: $Enums.ApprovalStatus | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
  }> {
    try {
      this.logger.log('Creating new booking', { properties });

      const parsedData = this.parseBookingData(properties);

      const booking = await this.db.booking.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Booking created successfully', {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
      });
      return booking;
    } catch (error) {
      this.logger.error('Failed to create booking', { error, properties });
      throw error;
    }
  }

  async findById(id: string): Promise<{
    id: string;
    bookingRef: string;
    pnr: string | null;
    userId: string;
    profileId: string | null;
    agentId: string | null;
    companyId: string | null;
    status: $Enums.BookingStatus;
    totalAmount: Decimal;
    currency: string;
    bookingType: $Enums.BookingType;
    travelDate: Date | null;
    returnDate: Date | null;
    passengers: JsonValue;
    costCenter: string | null;
    projectCode: string | null;
    reasonCode: string | null;
    approvalStatus: $Enums.ApprovalStatus | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
  } | null> {
    try {
      this.logger.debug('Finding booking by ID', { id });

      const booking = await this.db.booking.findUnique({
        where: { id },
      });

      if (booking) {
        this.logger.debug('Booking found', {
          bookingId: id,
          bookingRef: booking.bookingRef,
        });
      } else {
        this.logger.debug('Booking not found', { bookingId: id });
      }

      return booking;
    } catch (error) {
      this.logger.error('Failed to find booking by ID', { error, id });
      throw error;
    }
  }

  async findAll(
    options?:
      | FindAllOptions<{
          id: string;
          bookingRef: string;
          pnr: string | null;
          userId: string;
          profileId: string | null;
          agentId: string | null;
          companyId: string | null;
          status: $Enums.BookingStatus;
          totalAmount: Decimal;
          currency: string;
          bookingType: $Enums.BookingType;
          travelDate: Date | null;
          returnDate: Date | null;
          passengers: JsonValue;
          costCenter: string | null;
          projectCode: string | null;
          reasonCode: string | null;
          approvalStatus: $Enums.ApprovalStatus | null;
          createdAt: Date;
          updatedAt: Date;
          confirmedAt: Date | null;
          cancelledAt: Date | null;
        }>
      | undefined,
  ): Promise<
    {
      id: string;
      bookingRef: string;
      pnr: string | null;
      userId: string;
      profileId: string | null;
      agentId: string | null;
      companyId: string | null;
      status: $Enums.BookingStatus;
      totalAmount: Decimal;
      currency: string;
      bookingType: $Enums.BookingType;
      travelDate: Date | null;
      returnDate: Date | null;
      passengers: JsonValue;
      costCenter: string | null;
      projectCode: string | null;
      reasonCode: string | null;
      approvalStatus: $Enums.ApprovalStatus | null;
      createdAt: Date;
      updatedAt: Date;
      confirmedAt: Date | null;
      cancelledAt: Date | null;
    }[]
  > {
    try {
      this.logger.debug('Finding all bookings', { options });

      // Build the query based on options
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

      const bookings = await this.db.booking.findMany(queryOptions);

      this.logger.debug('Bookings retrieved successfully', {
        count: bookings.length,
        page: options?.page,
        limit: options?.limit,
      });
      return bookings;
    } catch (error) {
      this.logger.error('Failed to find all bookings', { error, options });
      throw error;
    }
  }

  async updateById(
    id: string,
    properties: BaseUpdateDto<{
      id: string;
      bookingRef: string;
      pnr: string | null;
      userId: string;
      profileId: string | null;
      agentId: string | null;
      companyId: string | null;
      status: $Enums.BookingStatus;
      totalAmount: Decimal;
      currency: string;
      bookingType: $Enums.BookingType;
      travelDate: Date | null;
      returnDate: Date | null;
      passengers: JsonValue;
      costCenter: string | null;
      projectCode: string | null;
      reasonCode: string | null;
      approvalStatus: $Enums.ApprovalStatus | null;
      createdAt: Date;
      updatedAt: Date;
      confirmedAt: Date | null;
      cancelledAt: Date | null;
    }>,
  ): Promise<{
    id: string;
    bookingRef: string;
    pnr: string | null;
    userId: string;
    profileId: string | null;
    agentId: string | null;
    companyId: string | null;
    status: $Enums.BookingStatus;
    totalAmount: Decimal;
    currency: string;
    bookingType: $Enums.BookingType;
    travelDate: Date | null;
    returnDate: Date | null;
    passengers: JsonValue;
    costCenter: string | null;
    projectCode: string | null;
    reasonCode: string | null;
    approvalStatus: $Enums.ApprovalStatus | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
  }> {
    try {
      this.logger.log('Updating booking', { id, properties });

      // Check if booking exists first
      const existingBooking = await this.db.booking.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        const error = new Error(`Booking with ID ${id} not found`);
        this.logger.error('Booking not found for update', { id });
        throw error;
      }

      const parsedData = this.parseBookingData(properties);

      const updatedBooking = await this.db.booking.update({
        where: { id },
        data: {
          ...parsedData,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Booking updated successfully', {
        bookingId: id,
        bookingRef: updatedBooking.bookingRef,
      });
      return updatedBooking;
    } catch (error) {
      this.logger.error('Failed to update booking', { error, id, properties });
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting booking', { id });

      // Check if booking exists first
      const existingBooking = await this.db.booking.findUnique({
        where: { id },
      });

      if (!existingBooking) {
        this.logger.warn('Booking not found for deletion', { id });
        return false;
      }

      await this.db.booking.delete({
        where: { id },
      });

      this.logger.log('Booking deleted successfully', {
        bookingId: id,
        bookingRef: existingBooking.bookingRef,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete booking', { error, id });
      throw error;
    }
  }

  // Additional utility methods specific to BookingService

  async findByBookingRef(bookingRef: string): Promise<{
    id: string;
    bookingRef: string;
    pnr: string | null;
    userId: string;
    profileId: string | null;
    agentId: string | null;
    companyId: string | null;
    status: $Enums.BookingStatus;
    totalAmount: Decimal;
    currency: string;
    bookingType: $Enums.BookingType;
    travelDate: Date | null;
    returnDate: Date | null;
    passengers: JsonValue;
    costCenter: string | null;
    projectCode: string | null;
    reasonCode: string | null;
    approvalStatus: $Enums.ApprovalStatus | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
  } | null> {
    try {
      this.logger.debug('Finding booking by booking reference', { bookingRef });

      const booking = await this.db.booking.findFirst({
        where: { bookingRef },
      });

      return booking;
    } catch (error) {
      this.logger.error('Failed to find booking by booking reference', {
        error,
        bookingRef,
      });
      throw error;
    }
  }

  async findByPnr(pnr: string): Promise<{
    id: string;
    bookingRef: string;
    pnr: string | null;
    userId: string;
    profileId: string | null;
    agentId: string | null;
    companyId: string | null;
    status: $Enums.BookingStatus;
    totalAmount: Decimal;
    currency: string;
    bookingType: $Enums.BookingType;
    travelDate: Date | null;
    returnDate: Date | null;
    passengers: JsonValue;
    costCenter: string | null;
    projectCode: string | null;
    reasonCode: string | null;
    approvalStatus: $Enums.ApprovalStatus | null;
    createdAt: Date;
    updatedAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
  } | null> {
    try {
      this.logger.debug('Finding booking by PNR', { pnr });

      const booking = await this.db.booking.findFirst({
        where: { pnr },
      });

      return booking;
    } catch (error) {
      this.logger.error('Failed to find booking by PNR', { error, pnr });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<
    {
      id: string;
      bookingRef: string;
      pnr: string | null;
      userId: string;
      profileId: string | null;
      agentId: string | null;
      companyId: string | null;
      status: $Enums.BookingStatus;
      totalAmount: Decimal;
      currency: string;
      bookingType: $Enums.BookingType;
      travelDate: Date | null;
      returnDate: Date | null;
      passengers: JsonValue;
      costCenter: string | null;
      projectCode: string | null;
      reasonCode: string | null;
      approvalStatus: $Enums.ApprovalStatus | null;
      createdAt: Date;
      updatedAt: Date;
      confirmedAt: Date | null;
      cancelledAt: Date | null;
    }[]
  > {
    try {
      this.logger.debug('Finding bookings by user ID', { userId });

      const bookings = await this.db.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return bookings;
    } catch (error) {
      this.logger.error('Failed to find bookings by user ID', {
        error,
        userId,
      });
      throw error;
    }
  }

  async findByStatus(status: $Enums.BookingStatus): Promise<
    {
      id: string;
      bookingRef: string;
      pnr: string | null;
      userId: string;
      profileId: string | null;
      agentId: string | null;
      companyId: string | null;
      status: $Enums.BookingStatus;
      totalAmount: Decimal;
      currency: string;
      bookingType: $Enums.BookingType;
      travelDate: Date | null;
      returnDate: Date | null;
      passengers: JsonValue;
      costCenter: string | null;
      projectCode: string | null;
      reasonCode: string | null;
      approvalStatus: $Enums.ApprovalStatus | null;
      createdAt: Date;
      updatedAt: Date;
      confirmedAt: Date | null;
      cancelledAt: Date | null;
    }[]
  > {
    try {
      this.logger.debug('Finding bookings by status', { status });

      const bookings = await this.db.booking.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' },
      });

      return bookings;
    } catch (error) {
      this.logger.error('Failed to find bookings by status', { error, status });
      throw error;
    }
  }

  async updateBookingStatus(
    id: string,
    status: $Enums.BookingStatus,
  ): Promise<boolean> {
    try {
      this.logger.log('Updating booking status', { id, status });

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      // Set specific date fields based on status
      if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }

      await this.db.booking.update({
        where: { id },
        data: updateData,
      });

      this.logger.log('Booking status updated successfully', {
        bookingId: id,
        status,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to update booking status', {
        error,
        id,
        status,
      });
      throw error;
    }
  }

  async updateApprovalStatus(
    id: string,
    approvalStatus: $Enums.ApprovalStatus,
  ): Promise<boolean> {
    try {
      this.logger.log('Updating booking approval status', {
        id,
        approvalStatus,
      });

      await this.db.booking.update({
        where: { id },
        data: {
          approvalStatus,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Booking approval status updated successfully', {
        bookingId: id,
        approvalStatus,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to update booking approval status', {
        error,
        id,
        approvalStatus,
      });
      throw error;
    }
  }

  // Data parsing methods for handling incoming string data
  private parseBookingData(data: any): any {
    const parsed = { ...data };

    // Parse enum fields
    if (typeof parsed.status === 'string') {
      parsed.status = parsed.status as $Enums.BookingStatus;
    }

    if (typeof parsed.bookingType === 'string') {
      parsed.bookingType = parsed.bookingType as $Enums.BookingType;
    }

    if (typeof parsed.approvalStatus === 'string') {
      parsed.approvalStatus = parsed.approvalStatus as $Enums.ApprovalStatus;
    }

    // Parse Decimal fields
    if (
      typeof parsed.totalAmount === 'string' ||
      typeof parsed.totalAmount === 'number'
    ) {
      parsed.totalAmount = new Decimal(parsed.totalAmount);
    }

    // Parse date fields
    if (typeof parsed.travelDate === 'string') {
      parsed.travelDate = new Date(parsed.travelDate);
    }

    if (typeof parsed.returnDate === 'string') {
      parsed.returnDate = new Date(parsed.returnDate);
    }

    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    if (typeof parsed.confirmedAt === 'string') {
      parsed.confirmedAt = new Date(parsed.confirmedAt);
    }

    if (typeof parsed.cancelledAt === 'string') {
      parsed.cancelledAt = new Date(parsed.cancelledAt);
    }

    // Parse JSON field
    if (typeof parsed.passengers === 'string') {
      try {
        parsed.passengers = JSON.parse(parsed.passengers);
      } catch (error) {
        this.logger.warn('Failed to parse passengers JSON', {
          error,
          passengers: parsed.passengers,
        });
        parsed.passengers = {};
      }
    }

    // Handle null values for optional string fields
    const nullableFields = [
      'pnr',
      'profileId',
      'agentId',
      'companyId',
      'costCenter',
      'projectCode',
      'reasonCode',
      'approvalStatus',
      'travelDate',
      'returnDate',
      'confirmedAt',
      'cancelledAt',
    ];

    nullableFields.forEach((field) => {
      if (parsed[field] === 'null' || parsed[field] === '') {
        parsed[field] = null;
      }
    });

    return parsed;
  }

  private parseFilters(filters: any): any {
    const parsed = { ...filters };

    // Parse enum filters
    if (typeof parsed.status === 'string') {
      parsed.status = parsed.status as $Enums.BookingStatus;
    }

    if (typeof parsed.bookingType === 'string') {
      parsed.bookingType = parsed.bookingType as $Enums.BookingType;
    }

    if (typeof parsed.approvalStatus === 'string') {
      parsed.approvalStatus = parsed.approvalStatus as $Enums.ApprovalStatus;
    }

    // Parse Decimal filters
    if (
      typeof parsed.totalAmount === 'string' ||
      typeof parsed.totalAmount === 'number'
    ) {
      parsed.totalAmount = new Decimal(parsed.totalAmount);
    }

    // Parse date filters
    if (typeof parsed.travelDate === 'string') {
      parsed.travelDate = new Date(parsed.travelDate);
    }

    if (typeof parsed.returnDate === 'string') {
      parsed.returnDate = new Date(parsed.returnDate);
    }

    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    if (typeof parsed.confirmedAt === 'string') {
      parsed.confirmedAt = new Date(parsed.confirmedAt);
    }

    if (typeof parsed.cancelledAt === 'string') {
      parsed.cancelledAt = new Date(parsed.cancelledAt);
    }

    // Handle null values for optional string fields
    const nullableFields = [
      'pnr',
      'profileId',
      'agentId',
      'companyId',
      'costCenter',
      'projectCode',
      'reasonCode',
      'approvalStatus',
      'travelDate',
      'returnDate',
      'confirmedAt',
      'cancelledAt',
    ];

    nullableFields.forEach((field) => {
      if (parsed[field] === 'null' || parsed[field] === '') {
        parsed[field] = null;
      }
    });

    // Handle date range filters
    if (parsed.travelDateFrom && typeof parsed.travelDateFrom === 'string') {
      if (!parsed.travelDate) parsed.travelDate = {};
      parsed.travelDate.gte = new Date(parsed.travelDateFrom);
      delete parsed.travelDateFrom;
    }

    if (parsed.travelDateTo && typeof parsed.travelDateTo === 'string') {
      if (!parsed.travelDate) parsed.travelDate = {};
      parsed.travelDate.lte = new Date(parsed.travelDateTo);
      delete parsed.travelDateTo;
    }

    if (parsed.createdAtFrom && typeof parsed.createdAtFrom === 'string') {
      if (!parsed.createdAt) parsed.createdAt = {};
      parsed.createdAt.gte = new Date(parsed.createdAtFrom);
      delete parsed.createdAtFrom;
    }

    if (parsed.createdAtTo && typeof parsed.createdAtTo === 'string') {
      if (!parsed.createdAt) parsed.createdAt = {};
      parsed.createdAt.lte = new Date(parsed.createdAtTo);
      delete parsed.createdAtTo;
    }

    // Handle amount range filters
    if (
      parsed.totalAmountMin &&
      (typeof parsed.totalAmountMin === 'string' ||
        typeof parsed.totalAmountMin === 'number')
    ) {
      if (!parsed.totalAmount) parsed.totalAmount = {};
      parsed.totalAmount.gte = new Decimal(parsed.totalAmountMin);
      delete parsed.totalAmountMin;
    }

    if (
      parsed.totalAmountMax &&
      (typeof parsed.totalAmountMax === 'string' ||
        typeof parsed.totalAmountMax === 'number')
    ) {
      if (!parsed.totalAmount) parsed.totalAmount = {};
      parsed.totalAmount.lte = new Decimal(parsed.totalAmountMax);
      delete parsed.totalAmountMax;
    }

    return parsed;
  }
}
