import { Injectable, Logger } from "@nestjs/common";
import { Payment, $Enums, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { BaseDto } from "lib/BaseDto";
import { BaseUpdateDto } from "lib/BaseUpdateDto";
import { FindAllOptions } from "lib/FindAllOptions";
import { ICommon } from "lib/ICommons.interface";
import { DbService } from "src/db/db.service";


@Injectable()
export class PaymentService
  implements ICommon<Payment, BaseDto, BaseUpdateDto<Payment>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  async create(
    properties: BaseDto,
  ): Promise<{
    id: string;
    bookingId: string;
    paymentIntentId: string | null;
    amount: Decimal;
    currency: string;
    status: $Enums.PaymentStatus;
    method: $Enums.PaymentMethod;
    gatewayResponse: Prisma.JsonValue | null;
    failureReason: string | null;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      this.logger.log('Creating new payment', { properties });

      const parsedData = this.parsePaymentData(properties);

      const payment = await this.db.payment.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Payment created successfully', {
        paymentId: payment.id,
        bookingId: payment.bookingId,
      });

      return payment;
    } catch (error) {
      this.logger.error('Failed to create payment', { error, properties });
      throw error;
    }
  }

  async findById(
    id: string,
  ): Promise<Payment | null> {
    try {
      this.logger.debug('Finding payment by ID', { id });

      const payment = await this.db.payment.findUnique({
        where: { id },
      });

      if (payment) {
        this.logger.debug('Payment found', { id: payment.id });
      } else {
        this.logger.debug('Payment not found', { id });
      }

      return payment;
    } catch (error) {
      this.logger.error('Failed to find payment by ID', { error, id });
      throw error;
    }
  }

  async findAll(
    options?: FindAllOptions<Payment>,
  ): Promise<Payment[]> {
    try {
      this.logger.debug('Finding all payments', { options });

      const queryOptions: any = {};

      // Pagination
      if (options?.page && options?.limit) {
        queryOptions.skip = (options.page - 1) * options.limit;
        queryOptions.take = options.limit;
      } else if (options?.limit) {
        queryOptions.take = options.limit;
      }

      // Filters
      if (options?.filters) {
        queryOptions.where = this.parseFilters(options.filters);
      }

      // Sorting
      if (options?.sort) {
        queryOptions.orderBy = {
          [options.sort.field]: options.sort.order,
        };
      }

      const payments = await this.db.payment.findMany(queryOptions);

      this.logger.debug('Payments retrieved successfully', {
        count: payments.length,
      });

      return payments;
    } catch (error) {
      this.logger.error('Failed to find payments', { error, options });
      throw error;
    }
  }

  async updateById(
    id: string,
    properties: BaseUpdateDto<Payment>,
  ): Promise<Payment> {
    try {
      this.logger.log('Updating payment', { id, properties });

      const existingPayment = await this.db.payment.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        const error = new Error(`Payment with ID ${id} not found`);
        this.logger.error('Payment not found for update', { id });
        throw error;
      }

      const parsedData = this.parsePaymentData(properties);

      const updatedPayment = await this.db.payment.update({
        where: { id },
        data: {
          ...parsedData,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Payment updated successfully', {
        id: updatedPayment.id,
      });

      return updatedPayment;
    } catch (error) {
      this.logger.error('Failed to update payment', { error, id, properties });
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting payment', { id });

      const existingPayment = await this.db.payment.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        this.logger.warn('Payment not found for deletion', { id });
        return false;
      }

      await this.db.payment.delete({ where: { id } });

      this.logger.log('Payment deleted successfully', { id });

      return true;
    } catch (error) {
      this.logger.error('Failed to delete payment', { error, id });
      throw error;
    }
  }

  // ---------------- Utilities ----------------

  private parsePaymentData(data: any): any {
    const parsed = { ...data };

    // Decimal conversion
    if (parsed.amount && !(parsed.amount instanceof Decimal)) {
      parsed.amount = new Decimal(parsed.amount);
    }

    // JSON parsing for gatewayResponse
    if (typeof parsed.gatewayResponse === 'string') {
      try {
        parsed.gatewayResponse = JSON.parse(parsed.gatewayResponse);
      } catch {
        this.logger.warn('Invalid gatewayResponse JSON', {
          gatewayResponse: parsed.gatewayResponse,
        });
      }
    }

    // Dates
    if (typeof parsed.processedAt === 'string') {
      parsed.processedAt = new Date(parsed.processedAt);
    }
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    return parsed;
  }

  private parseFilters(filters: any): any {
    const parsed = { ...filters };

    if (parsed.amountFrom) {
      parsed.amount = { ...parsed.amount, gte: new Decimal(parsed.amountFrom) };
      delete parsed.amountFrom;
    }
    if (parsed.amountTo) {
      parsed.amount = { ...parsed.amount, lte: new Decimal(parsed.amountTo) };
      delete parsed.amountTo;
    }

    if (typeof parsed.processedAt === 'string') {
      parsed.processedAt = new Date(parsed.processedAt);
    }
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    return parsed;
  }

  // ---------------- Extra Helpers ----------------

  async markAsProcessed(id: string, gatewayResponse: any): Promise<Payment> {
    try {
      this.logger.log('Marking payment as processed', { id });

      const updatedPayment = await this.db.payment.update({
        where: { id },
        data: {
          status: $Enums.PaymentStatus.COMPLETED,
          gatewayResponse,
          processedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Payment processed successfully', { id });

      return updatedPayment;
    } catch (error) {
      this.logger.error('Failed to mark payment as processed', { error, id });
      throw error;
    }
  }

  async recordFailure(id: string, reason: string, gatewayResponse?: any): Promise<Payment> {
    try {
      this.logger.warn('Recording payment failure', { id, reason });

      const updatedPayment = await this.db.payment.update({
        where: { id },
        data: {
          status: $Enums.PaymentStatus.FAILED,
          failureReason: reason,
          gatewayResponse: gatewayResponse ?? null,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Payment failure recorded', { id });

      return updatedPayment;
    } catch (error) {
      this.logger.error('Failed to record payment failure', { error, id });
      throw error;
    }
  }
}
