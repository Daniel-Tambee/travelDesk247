import { Injectable, Logger } from '@nestjs/common';
import { Session } from '@prisma/client';

import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class SessionService
  implements ICommon<Session, BaseDto, BaseUpdateDto<Session>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  async create(properties: BaseDto): Promise<Session> {
    try {
      this.logger.log('Creating new session', { properties });

      const parsedData = this.parseSessionData(properties);

      const session = await this.db.session.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Session created successfully', {
        sessionId: session.id,
      });
      return session;
    } catch (error) {
      this.logger.error('Failed to create session', { error, properties });
      throw error;
    }
  }

  async findById(id: string): Promise<Session | null> {
    try {
      this.logger.debug('Finding session by ID', { id });

      const session = await this.db.session.findUnique({
        where: { id },
      });

      if (session) {
        this.logger.debug('Session found', { sessionId: id });
      } else {
        this.logger.debug('Session not found', { sessionId: id });
      }

      return session;
    } catch (error) {
      this.logger.error('Failed to find session by ID', { error, id });
      throw error;
    }
  }

  async findAll(options?: FindAllOptions<Session>): Promise<Session[]> {
    try {
      this.logger.debug('Finding all sessions', { options });

      const queryOptions: any = {};

      if (options?.page && options?.limit) {
        queryOptions.skip = (options.page - 1) * options.limit;
        queryOptions.take = options.limit;
      } else if (options?.limit) {
        queryOptions.take = options.limit;
      }

      if (options?.filters) {
        queryOptions.where = this.parseFilters(options.filters);
      }

      if (options?.sort) {
        queryOptions.orderBy = {
          [options.sort.field]: options.sort.order,
        };
      }

      const sessions = await this.db.session.findMany(queryOptions);

      this.logger.debug('Sessions retrieved successfully', {
        count: sessions.length,
        page: options?.page,
        limit: options?.limit,
      });
      return sessions;
    } catch (error) {
      this.logger.error('Failed to find all sessions', { error, options });
      throw error;
    }
  }

  async updateById(id: string, properties: BaseUpdateDto<Session>): Promise<Session> {
    try {
      this.logger.log('Updating session', { id, properties });

      const existingSession = await this.db.session.findUnique({
        where: { id },
      });

      if (!existingSession) {
        const error = new Error(`Session with ID ${id} not found`);
        this.logger.error('Session not found for update', { id });
        throw error;
      }

      const parsedData = this.parseSessionData(properties);

      const updatedSession = await this.db.session.update({
        where: { id },
        data: {
          ...parsedData,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Session updated successfully', { sessionId: id });
      return updatedSession;
    } catch (error) {
      this.logger.error('Failed to update session', { error, id, properties });
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting session', { id });

      const existingSession = await this.db.session.findUnique({
        where: { id },
      });

      if (!existingSession) {
        this.logger.warn('Session not found for deletion', { id });
        return false;
      }

      await this.db.session.delete({
        where: { id },
      });

      this.logger.log('Session deleted successfully', { sessionId: id });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete session', { error, id });
      throw error;
    }
  }

  // ---

  /**
   * Helper method to parse incoming data to ensure correct types.
   * @param data The incoming session data.
   * @returns The parsed session data.
   */
  private parseSessionData(data: any): any {
    const parsed = { ...data };

    // Handle date fields
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }
    if (typeof parsed.expiresAt === 'string') {
      parsed.expiresAt = new Date(parsed.expiresAt);
    }

    // Parse JSON field
    if (typeof parsed.data === 'string') {
      try {
        parsed.data = JSON.parse(parsed.data);
      } catch (error) {
        this.logger.warn('Failed to parse data JSON', {
          error,
          data: parsed.data,
        });
        parsed.data = {};
      }
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

    // Handle date filters for range queries
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
