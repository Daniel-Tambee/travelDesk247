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
import { CarBookingService } from './car-booking.service';
import { CarBooking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('car-bookings')
@Controller('car-bookings')
export class CarBookingController {
  constructor(private readonly carBookingService: CarBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new car booking' })
  @ApiResponse({
    status: 201,
    description: 'The car booking has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createCarBookingDto: BaseDto,
  ): Promise<CarBooking> {
    try {
      return await this.carBookingService.create(createCarBookingDto);
    } catch (error) {
      this.carBookingService.logger.error(
        'Failed to create car booking',
        error,
      );
      throw new InternalServerErrorException('Failed to create car booking');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all car bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of all car bookings.',
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
    @Query('sortField') sortField?: keyof CarBooking,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<CarBooking[]> {
    try {
      const options: FindAllOptions<CarBooking> = {
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
      return await this.carBookingService.findAll(options);
    } catch (error) {
      this.carBookingService.logger.error(
        'Failed to fetch car bookings',
        error,
      );
      throw new InternalServerErrorException('Failed to fetch car bookings');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a car booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Car booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The car booking with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Car booking not found.',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<CarBooking> {
    try {
      const carBooking = await this.carBookingService.findById(id);
      if (!carBooking) {
        throw new NotFoundException(`Car booking with ID ${id} not found`);
      }
      return carBooking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.carBookingService.logger.error(
        `Failed to fetch car booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch car booking');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a car booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Car booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The car booking has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Car booking not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCarBookingDto: BaseUpdateDto<CarBooking>,
  ): Promise<CarBooking> {
    try {
      return await this.carBookingService.updateById(id, updateCarBookingDto);
    } catch (error) {
      this.carBookingService.logger.error(
        `Failed to update car booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update car booking');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a car booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Car booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The car booking has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Car booking not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.carBookingService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Car booking with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.carBookingService.logger.error(
        `Failed to delete car booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete car booking');
    }
  }
}
