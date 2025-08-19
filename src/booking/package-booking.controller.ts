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
import { PackageBookingService } from './package-booking.service';
import { PackageBooking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('package-bookings')
@Controller('package-bookings')
export class PackageBookingController {
  constructor(private readonly packageBookingService: PackageBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new package booking' })
  @ApiResponse({
    status: 201,
    description: 'The package booking has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createPackageBookingDto: BaseDto,
  ): Promise<PackageBooking> {
    try {
      return await this.packageBookingService.create(createPackageBookingDto);
    } catch (error) {
      this.packageBookingService.logger.error(
        'Failed to create package booking',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create package booking',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all package bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of all package bookings.',
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
    @Query('sortField') sortField?: keyof PackageBooking,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<PackageBooking[]> {
    try {
      const options: FindAllOptions<PackageBooking> = {
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
      return await this.packageBookingService.findAll(options);
    } catch (error) {
      this.packageBookingService.logger.error(
        'Failed to fetch package bookings',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch package bookings',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Package booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The package booking with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Package booking not found.',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PackageBooking> {
    try {
      const packageBooking = await this.packageBookingService.findById(id);
      if (!packageBooking) {
        throw new NotFoundException(`Package booking with ID ${id} not found`);
      }
      return packageBooking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.packageBookingService.logger.error(
        `Failed to fetch package booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch package booking');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a package booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Package booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The package booking has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Package booking not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe)
    updatePackageBookingDto: BaseUpdateDto<PackageBooking>,
  ): Promise<PackageBooking> {
    try {
      return await this.packageBookingService.updateById(
        id,
        updatePackageBookingDto,
      );
    } catch (error) {
      this.packageBookingService.logger.error(
        `Failed to update package booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update package booking',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a package booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Package booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The package booking has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Package booking not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.packageBookingService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Package booking with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.packageBookingService.logger.error(
        `Failed to delete package booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to delete package booking',
      );
    }
  }
}
