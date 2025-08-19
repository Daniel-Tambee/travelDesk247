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
import { HotelBookingService } from './hotel-booking.service';
import { HotelBooking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('hotel-bookings')
@Controller('hotel-bookings')
export class HotelBookingController {
  constructor(private readonly hotelBookingService: HotelBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new hotel booking' })
  @ApiResponse({
    status: 201,
    description: 'The hotel booking has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createHotelBookingDto: BaseDto,
  ): Promise<HotelBooking> {
    try {
      return await this.hotelBookingService.create(createHotelBookingDto);
    } catch (error) {
      this.hotelBookingService.logger.error(
        'Failed to create hotel booking',
        error,
      );
      throw new InternalServerErrorException('Failed to create hotel booking');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotel bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of all hotel bookings.',
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
    @Query('sortField') sortField?: keyof HotelBooking,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<HotelBooking[]> {
    try {
      const options: FindAllOptions<HotelBooking> = {
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
      return await this.hotelBookingService.findAll(options);
    } catch (error) {
      this.hotelBookingService.logger.error(
        'Failed to fetch hotel bookings',
        error,
      );
      throw new InternalServerErrorException('Failed to fetch hotel bookings');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotel booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Hotel booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The hotel booking with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Hotel booking not found.',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HotelBooking> {
    try {
      const hotelBooking = await this.hotelBookingService.findById(id);
      if (!hotelBooking) {
        throw new NotFoundException(`Hotel booking with ID ${id} not found`);
      }
      return hotelBooking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.hotelBookingService.logger.error(
        `Failed to fetch hotel booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch hotel booking');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a hotel booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Hotel booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The hotel booking has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Hotel booking not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateHotelBookingDto: BaseUpdateDto<HotelBooking>,
  ): Promise<HotelBooking> {
    try {
      return await this.hotelBookingService.updateById(
        id,
        updateHotelBookingDto,
      );
    } catch (error) {
      this.hotelBookingService.logger.error(
        `Failed to update hotel booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update hotel booking');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hotel booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Hotel booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The hotel booking has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Hotel booking not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.hotelBookingService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Hotel booking with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.hotelBookingService.logger.error(
        `Failed to delete hotel booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete hotel booking');
    }
  }
}
