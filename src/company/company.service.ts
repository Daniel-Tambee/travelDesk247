import { Injectable, Logger } from '@nestjs/common';
import { Decimal, JsonValue } from '@prisma/client/runtime/library';
import { Company } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class CompanyService
  implements ICommon<Company, BaseDto, BaseUpdateDto<Company>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  async create(properties: BaseDto): Promise<{
    name: string;
    id: string;
    code: string;
    contactEmail: string;
    contactPhone: string | null;
    address: JsonValue | null;
    paymentTerms: string | null;
    creditLimit: Decimal | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      this.logger.log('Creating new company', { properties });

      const parsedData = this.parseCompanyData(properties);

      const company = await this.db.company.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Company created successfully', {
        companyId: company.id,
        companyName: company.name,
      });
      return company;
    } catch (error) {
      this.logger.error('Failed to create company', { error, properties });
      throw error;
    }
  }

  async findById(id: string): Promise<{
    name: string;
    id: string;
    code: string;
    contactEmail: string;
    contactPhone: string | null;
    address: JsonValue | null;
    paymentTerms: string | null;
    creditLimit: Decimal | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      this.logger.debug('Finding company by ID', { id });

      const company = await this.db.company.findUnique({
        where: { id },
      });

      if (company) {
        this.logger.debug('Company found', {
          companyId: id,
          name: company.name,
        });
      } else {
        this.logger.debug('Company not found', { companyId: id });
      }

      return company;
    } catch (error) {
      this.logger.error('Failed to find company by ID', { error, id });
      throw error;
    }
  }

  async findAll(
    options?: FindAllOptions<{
      name: string;
      id: string;
      code: string;
      contactEmail: string;
      contactPhone: string | null;
      address: JsonValue | null;
      paymentTerms: string | null;
      creditLimit: Decimal | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>,
  ): Promise<
    {
      name: string;
      id: string;
      code: string;
      contactEmail: string;
      contactPhone: string | null;
      address: JsonValue | null;
      paymentTerms: string | null;
      creditLimit: Decimal | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }[]
  > {
    try {
      this.logger.debug('Finding all companies', { options });

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

      const companies = await this.db.company.findMany(queryOptions);

      this.logger.debug('Companies retrieved successfully', {
        count: companies.length,
        page: options?.page,
        limit: options?.limit,
      });
      return companies;
    } catch (error) {
      this.logger.error('Failed to find all companies', { error, options });
      throw error;
    }
  }

  async updateById(
    id: string,
    properties: BaseUpdateDto<{
      name: string;
      id: string;
      code: string;
      contactEmail: string;
      contactPhone: string | null;
      address: JsonValue | null;
      paymentTerms: string | null;
      creditLimit: Decimal | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>,
  ): Promise<{
    name: string;
    id: string;
    code: string;
    contactEmail: string;
    contactPhone: string | null;
    address: JsonValue | null;
    paymentTerms: string | null;
    creditLimit: Decimal | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      this.logger.log('Updating company', { id, properties });

      const existingCompany = await this.db.company.findUnique({
        where: { id },
      });

      if (!existingCompany) {
        const error = new Error(`Company with ID ${id} not found`);
        this.logger.error('Company not found for update', { id });
        throw error;
      }

      const parsedData = this.parseCompanyData(properties);

      const updatedCompany = await this.db.company.update({
        where: { id },
        data: {
          ...parsedData,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Company updated successfully', {
        companyId: id,
        companyName: updatedCompany.name,
      });
      return updatedCompany;
    } catch (error) {
      this.logger.error('Failed to update company', { error, id, properties });
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting company', { id });

      const existingCompany = await this.db.company.findUnique({
        where: { id },
      });

      if (!existingCompany) {
        this.logger.warn('Company not found for deletion', { id });
        return false;
      }

      await this.db.company.delete({
        where: { id },
      });

      this.logger.log('Company deleted successfully', {
        companyId: id,
        companyName: existingCompany.name,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete company', { error, id });
      throw error;
    }
  }

  // ---------------------- Utilities ----------------------

  private parseCompanyData(data: any): any {
    const parsed = { ...data };

    // Decimal field
    if (
      typeof parsed.creditLimit === 'string' ||
      typeof parsed.creditLimit === 'number'
    ) {
      parsed.creditLimit = new Decimal(parsed.creditLimit);
    }

    // JSON field
    if (typeof parsed.address === 'string') {
      try {
        parsed.address = JSON.parse(parsed.address);
      } catch (error) {
        this.logger.warn('Failed to parse address JSON', {
          error,
          address: parsed.address,
        });
        parsed.address = {};
      }
    }

    // Boolean field
    if (typeof parsed.isActive === 'string') {
      parsed.isActive = parsed.isActive === 'true';
    }

    // Nullables
    const nullableFields = [
      'contactPhone',
      'address',
      'paymentTerms',
      'creditLimit',
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

    // Decimal filter
    if (
      typeof parsed.creditLimit === 'string' ||
      typeof parsed.creditLimit === 'number'
    ) {
      parsed.creditLimit = new Decimal(parsed.creditLimit);
    }

    // Boolean filter
    if (typeof parsed.isActive === 'string') {
      parsed.isActive = parsed.isActive === 'true';
    }

    // Date filters
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    // Nullables
    const nullableFields = [
      'contactPhone',
      'address',
      'paymentTerms',
      'creditLimit',
    ];

    nullableFields.forEach((field) => {
      if (parsed[field] === 'null' || parsed[field] === '') {
        parsed[field] = null;
      }
    });

    // Range filters
    if (
      parsed.creditLimitMin &&
      (typeof parsed.creditLimitMin === 'string' ||
        typeof parsed.creditLimitMin === 'number')
    ) {
      if (!parsed.creditLimit) parsed.creditLimit = {};
      parsed.creditLimit.gte = new Decimal(parsed.creditLimitMin);
      delete parsed.creditLimitMin;
    }

    if (
      parsed.creditLimitMax &&
      (typeof parsed.creditLimitMax === 'string' ||
        typeof parsed.creditLimitMax === 'number')
    ) {
      if (!parsed.creditLimit) parsed.creditLimit = {};
      parsed.creditLimit.lte = new Decimal(parsed.creditLimitMax);
      delete parsed.creditLimitMax;
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
}
