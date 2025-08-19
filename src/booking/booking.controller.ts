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
import { BookingService } from './booking.service';
import { Booking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: 201,
    description: 'The booking has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createBookingDto: BaseDto,
  ): Promise<Booking> {
    try {
      return await this.bookingService.create(createBookingDto);
    } catch (error) {
      this.bookingService.logger.error('Failed to create booking', error);
      throw new InternalServerErrorException('Failed to create booking');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of all bookings.',
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
    @Query('sortField') sortField?: keyof Booking,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<Booking[]> {
    try {
      const options: FindAllOptions<Booking> = {
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
      return await this.bookingService.findAll(options);
    } catch (error) {
      this.bookingService.logger.error('Failed to fetch bookings', error);
      throw new InternalServerErrorException('Failed to fetch bookings');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The booking with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found.',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Booking> {
    try {
      const booking = await this.bookingService.findById(id);
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.bookingService.logger.error(
        `Failed to fetch booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch booking');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The booking has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateBookingDto: BaseUpdateDto<Booking>,
  ): Promise<Booking> {
    try {
      return await this.bookingService.updateById(id, updateBookingDto);
    } catch (error) {
      this.bookingService.logger.error(
        `Failed to update booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update booking');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The booking has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.bookingService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.bookingService.logger.error(
        `Failed to delete booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete booking');
    }
  }
}
