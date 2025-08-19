import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TravellerProfileService } from './traveller-profile.service';
import { TravelerProfile } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('traveller-profiles')
@Controller('traveller-profiles')
export class TravellerProfileController {
  constructor(
    private readonly travellerProfileService: TravellerProfileService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new traveller profile' })
  @ApiResponse({
    status: 201,
    description: 'The traveller profile has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createTravellerProfileDto: BaseDto,
  ): Promise<TravelerProfile> {
    try {
      return await this.travellerProfileService.create(
        createTravellerProfileDto,
      );
    } catch (error) {
      this.travellerProfileService.logger.error(
        'Failed to create traveller profile',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create traveller profile',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all traveller profiles' })
  @ApiResponse({
    status: 200,
    description: 'List of all traveller profiles.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortField') sortField?: keyof TravelerProfile,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<TravelerProfile[]> {
    try {
      const options: FindAllOptions<TravelerProfile> = {
        page,
        limit,
        ...(sortField &&
          sortOrder && {
            sort: {
              field: sortField,
              order: sortOrder,
            },
          }),
      };
      return await this.travellerProfileService.findAll(options);
    } catch (error) {
      this.travellerProfileService.logger.error(
        'Failed to fetch traveller profiles',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch traveller profiles',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a traveller profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'Traveller profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The traveller profile with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Traveller profile not found.',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TravelerProfile> {
    try {
      const travellerProfile = await this.travellerProfileService.findById(id);
      if (!travellerProfile) {
        throw new NotFoundException(
          `Traveller profile with ID ${id} not found`,
        );
      }
      return travellerProfile;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.travellerProfileService.logger.error(
        `Failed to fetch traveller profile with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch traveller profile',
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a traveller profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'Traveller profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The traveller profile has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Traveller profile not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe)
    updateTravellerProfileDto: BaseUpdateDto<TravelerProfile>,
  ): Promise<TravelerProfile> {
    try {
      return await this.travellerProfileService.updateById(
        id,
        updateTravellerProfileDto,
      );
    } catch (error) {
      this.travellerProfileService.logger.error(
        `Failed to update traveller profile with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update traveller profile',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a traveller profile by ID' })
  @ApiParam({
    name: 'id',
    description: 'Traveller profile ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The traveller profile has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Traveller profile not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.travellerProfileService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(
          `Traveller profile with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.travellerProfileService.logger.error(
        `Failed to delete traveller profile with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to delete traveller profile',
      );
    }
  }
}
