import { Injectable, Logger } from '@nestjs/common';

import { OtpCode, $Enums } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class OtpService
  implements ICommon<OtpCode, BaseDto, BaseUpdateDto<OtpCode>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  async create(properties: BaseDto): Promise<{
    id: string;
    userId: string;
    code: string;
    type: $Enums.OtpType;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
  }> {
    try {
      this.logger.log('Creating new OTP', { properties });

      const parsedData = this.parseOtpData(properties);

      const otp = await this.db.otpCode.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          verified: false,
        },
      });

      this.logger.log('OTP created successfully', {
        otpId: otp.id,
        userId: otp.userId,
      });

      return otp;
    } catch (error) {
      this.logger.error('Failed to create OTP', { error, properties });
      throw error;
    }
  }

  async findById(id: string): Promise<{
    id: string;
    userId: string;
    code: string;
    type: $Enums.OtpType;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
  } | null> {
    try {
      this.logger.debug('Finding OTP by ID', { id });

      const otp = await this.db.otpCode.findUnique({
        where: { id },
      });

      if (otp) {
        this.logger.debug('OTP found', { otpId: otp.id });
      } else {
        this.logger.debug('OTP not found', { id });
      }

      return otp;
    } catch (error) {
      this.logger.error('Failed to find OTP by ID', { error, id });
      throw error;
    }
  }

  async findAll(
    options?: FindAllOptions<{
      id: string;
      userId: string;
      code: string;
      type: $Enums.OtpType;
      expiresAt: Date;
      verified: boolean;
      createdAt: Date;
    }>,
  ): Promise<
    {
      id: string;
      userId: string;
      code: string;
      type: $Enums.OtpType;
      expiresAt: Date;
      verified: boolean;
      createdAt: Date;
    }[]
  > {
    try {
      this.logger.debug('Finding all OTPs', { options });

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

      const otps = await this.db.otpCode.findMany(queryOptions);

      this.logger.debug('OTPs retrieved successfully', {
        count: otps.length,
        page: options?.page,
        limit: options?.limit,
      });

      return otps;
    } catch (error) {
      this.logger.error('Failed to find OTPs', { error, options });
      throw error;
    }
  }

  async updateById(
    id: string,
    properties: BaseUpdateDto<{
      id: string;
      userId: string;
      code: string;
      type: $Enums.OtpType;
      expiresAt: Date;
      verified: boolean;
      createdAt: Date;
    }>,
  ): Promise<{
    id: string;
    userId: string;
    code: string;
    type: $Enums.OtpType;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
  }> {
    try {
      this.logger.log('Updating OTP', { id, properties });

      const existingOtp = await this.db.otpCode.findUnique({
        where: { id },
      });

      if (!existingOtp) {
        const error = new Error(`OTP with ID ${id} not found`);
        this.logger.error('OTP not found for update', { id });
        throw error;
      }

      const parsedData = this.parseOtpData(properties);

      const updatedOtp = await this.db.otpCode.update({
        where: { id },
        data: {
          ...parsedData,
        },
      });

      this.logger.log('OTP updated successfully', {
        otpId: updatedOtp.id,
        userId: updatedOtp.userId,
      });

      return updatedOtp;
    } catch (error) {
      this.logger.error('Failed to update OTP', { error, id, properties });
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting OTP', { id });

      const existingOtp = await this.db.otpCode.findUnique({
        where: { id },
      });

      if (!existingOtp) {
        this.logger.warn('OTP not found for deletion', { id });
        return false;
      }

      await this.db.otpCode.delete({
        where: { id },
      });

      this.logger.log('OTP deleted successfully', {
        otpId: id,
        userId: existingOtp.userId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to delete OTP', { error, id });
      throw error;
    }
  }

  // ---------------------- Utilities ----------------------

  private parseOtpData(data: any): any {
    const parsed = { ...data };

    // Convert string dates
    if (typeof parsed.expiresAt === 'string') {
      parsed.expiresAt = new Date(parsed.expiresAt);
    }

    // Boolean for verified
    if (typeof parsed.verified === 'string') {
      parsed.verified = parsed.verified === 'true';
    }

    return parsed;
  }

  private parseFilters(filters: any): any {
    const parsed = { ...filters };

    // Convert string to boolean
    if (typeof parsed.verified === 'string') {
      parsed.verified = parsed.verified === 'true';
    }

    // Date filters
    if (typeof parsed.expiresAt === 'string') {
      parsed.expiresAt = new Date(parsed.expiresAt);
    }
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    // Ranges
    if (parsed.expiresAtFrom && typeof parsed.expiresAtFrom === 'string') {
      if (!parsed.expiresAt) parsed.expiresAt = {};
      parsed.expiresAt.gte = new Date(parsed.expiresAtFrom);
      delete parsed.expiresAtFrom;
    }

    if (parsed.expiresAtTo && typeof parsed.expiresAtTo === 'string') {
      if (!parsed.expiresAt) parsed.expiresAt = {};
      parsed.expiresAt.lte = new Date(parsed.expiresAtTo);
      delete parsed.expiresAtTo;
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

    return parsed;
  }

  // ---------------------- Extra Helpers ----------------------

  async findValidOtp(userId: string, type: $Enums.OtpType, code: string) {
    try {
      this.logger.debug('Finding valid OTP', { userId, type });

      const otp = await this.db.otpCode.findFirst({
        where: {
          userId,
          type,
          code,
          expiresAt: { gt: new Date() },
          verified: false,
        },
      });

      return otp;
    } catch (error) {
      this.logger.error('Failed to find valid OTP', { error, userId, type });
      throw error;
    }
  }

  async markAsVerified(id: string): Promise<boolean> {
    try {
      this.logger.log('Marking OTP as verified', { id });

      const otp = await this.db.otpCode.update({
        where: { id },
        data: { verified: true },
      });

      this.logger.log('OTP marked as verified', { otpId: otp.id });
      return true;
    } catch (error) {
      this.logger.error('Failed to mark OTP as verified', { error, id });
      throw error;
    }
  }
}
