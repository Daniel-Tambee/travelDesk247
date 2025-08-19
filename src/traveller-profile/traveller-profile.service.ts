import { Injectable, Logger } from '@nestjs/common';
import { TravelerProfile } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { ICommon } from 'lib/ICommons.interface';
import { DbService } from 'src/db/db.service';

@Injectable()
export class TravellerProfileService
  implements ICommon<TravelerProfile, BaseDto, BaseUpdateDto<TravelerProfile>>
{
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  /**
   * Creates a new traveler profile in the database.
   * @param properties The data for the new traveler profile.
   * @returns A promise that resolves to the created traveler profile.
   */
  async create(properties: BaseDto): Promise<TravelerProfile> {
    try {
      this.logger.log('Creating new traveler profile', { properties });

      const parsedData = this.parseTravelerProfileData(properties);

      const travelerProfile = await this.db.travelerProfile.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Traveler profile created successfully', {
        profileId: travelerProfile.id,
      });
      return travelerProfile;
    } catch (error) {
      this.logger.error('Failed to create traveler profile', {
        error,
        properties,
      });
      throw error;
    }
  }

  /**
   * Finds a traveler profile by its unique ID.
   * @param id The ID of the traveler profile to find.
   * @returns A promise that resolves to the found traveler profile, or null if not found.
   */
  async findById(id: string): Promise<TravelerProfile | null> {
    try {
      this.logger.debug('Finding traveler profile by ID', { id });

      const travelerProfile = await this.db.travelerProfile.findUnique({
        where: { id },
      });

      if (travelerProfile) {
        this.logger.debug('Traveler profile found', { profileId: id });
      } else {
        this.logger.debug('Traveler profile not found', { profileId: id });
      }

      return travelerProfile;
    } catch (error) {
      this.logger.error('Failed to find traveler profile by ID', { error, id });
      throw error;
    }
  }

  /**
   * Finds all traveler profiles based on the provided options.
   * @param options Pagination, filtering, and sorting options.
   * @returns A promise that resolves to an array of traveler profiles.
   */
  async findAll(
    options?: FindAllOptions<TravelerProfile>,
  ): Promise<TravelerProfile[]> {
    try {
      this.logger.debug('Finding all traveler profiles', { options });

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

      const travelerProfiles =
        await this.db.travelerProfile.findMany(queryOptions);

      this.logger.debug('Traveler profiles retrieved successfully', {
        count: travelerProfiles.length,
        page: options?.page,
        limit: options?.limit,
      });
      return travelerProfiles;
    } catch (error) {
      this.logger.error('Failed to find all traveler profiles', {
        error,
        options,
      });
      throw error;
    }
  }

  /**
   * Updates an existing traveler profile by its ID.
   * @param id The ID of the traveler profile to update.
   * @param properties The data to update.
   * @returns A promise that resolves to the updated traveler profile.
   */
  async updateById(
    id: string,
    properties: BaseUpdateDto<TravelerProfile>,
  ): Promise<TravelerProfile> {
    try {
      this.logger.log('Updating traveler profile', { id, properties });

      // Check if profile exists first
      const existingProfile = await this.db.travelerProfile.findUnique({
        where: { id },
      });

      if (!existingProfile) {
        const error = new Error(`Traveler profile with ID ${id} not found`);
        this.logger.error('Traveler profile not found for update', { id });
        throw error;
      }

      const parsedData = this.parseTravelerProfileData(properties);

      const updatedProfile = await this.db.travelerProfile.update({
        where: { id },
        data: {
          ...parsedData,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Traveler profile updated successfully', {
        profileId: id,
      });
      return updatedProfile;
    } catch (error) {
      this.logger.error('Failed to update traveler profile', {
        error,
        id,
        properties,
      });
      throw error;
    }
  }

  /**
   * Deletes a traveler profile by its unique ID.
   * @param id The ID of the traveler profile to delete.
   * @returns A promise that resolves to a boolean indicating success or failure.
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting traveler profile', { id });

      // Check if profile exists first
      const existingProfile = await this.db.travelerProfile.findUnique({
        where: { id },
      });

      if (!existingProfile) {
        this.logger.warn('Traveler profile not found for deletion', { id });
        return false;
      }

      await this.db.travelerProfile.delete({
        where: { id },
      });

      this.logger.log('Traveler profile deleted successfully', {
        profileId: id,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete traveler profile', { error, id });
      throw error;
    }
  }

  // --- Utility Methods ---

  /**
   * Helper method to parse incoming data and ensure correct data types.
   * @param data The incoming traveler profile data.
   * @returns The parsed data.
   */
  private parseTravelerProfileData(data: any): any {
    const parsed = { ...data };

    // Parse boolean field
    if (typeof parsed.isDefault === 'string') {
      parsed.isDefault = parsed.isDefault === 'true';
    }

    // Parse date fields
    if (typeof parsed.passportExpiry === 'string') {
      parsed.passportExpiry = new Date(parsed.passportExpiry);
    }
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    // Parse JSON fields
    if (typeof parsed.frequentFlyer === 'string') {
      try {
        parsed.frequentFlyer = JSON.parse(parsed.frequentFlyer);
      } catch (error) {
        this.logger.warn('Failed to parse frequentFlyer JSON', {
          error,
          frequentFlyer: parsed.frequentFlyer,
        });
        parsed.frequentFlyer = {};
      }
    }

    if (typeof parsed.emergencyContact === 'string') {
      try {
        parsed.emergencyContact = JSON.parse(parsed.emergencyContact);
      } catch (error) {
        this.logger.warn('Failed to parse emergencyContact JSON', {
          error,
          emergencyContact: parsed.emergencyContact,
        });
        parsed.emergencyContact = {};
      }
    }

    // Handle null values for optional string fields
    const nullableFields = [
      'passportNumber',
      'issuingCountry',
      'dietaryReqs',
      'accessibilityReqs',
    ];
    nullableFields.forEach((field) => {
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
