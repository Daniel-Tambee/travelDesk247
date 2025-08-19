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
import { FlightBookingService } from './flight-booking.service';
import { FlightBooking } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('flight-bookings')
@Controller('flight-bookings')
export class FlightBookingController {
  constructor(private readonly flightBookingService: FlightBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flight booking' })
  @ApiResponse({
    status: 201,
    description: 'The flight booking has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createFlightBookingDto: BaseDto,
  ): Promise<FlightBooking> {
    try {
      return await this.flightBookingService.create(createFlightBookingDto);
    } catch (error) {
      this.flightBookingService.logger.error(
        'Failed to create flight booking',
        error,
      );
      throw new InternalServerErrorException('Failed to create flight booking');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all flight bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of all flight bookings.',
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
    @Query('sortField') sortField?: keyof FlightBooking,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<FlightBooking[]> {
    try {
      const options: FindAllOptions<FlightBooking> = {
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
      return await this.flightBookingService.findAll(options);
    } catch (error) {
      this.flightBookingService.logger.error(
        'Failed to fetch flight bookings',
        error,
      );
      throw new InternalServerErrorException('Failed to fetch flight bookings');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flight booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Flight booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The flight booking with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Flight booking not found.',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FlightBooking> {
    try {
      const flightBooking = await this.flightBookingService.findById(id);
      if (!flightBooking) {
        throw new NotFoundException(`Flight booking with ID ${id} not found`);
      }
      return flightBooking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.flightBookingService.logger.error(
        `Failed to fetch flight booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch flight booking');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a flight booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Flight booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The flight booking has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Flight booking not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateFlightBookingDto: BaseUpdateDto<FlightBooking>,
  ): Promise<FlightBooking> {
    try {
      return await this.flightBookingService.updateById(
        id,
        updateFlightBookingDto,
      );
    } catch (error) {
      this.flightBookingService.logger.error(
        `Failed to update flight booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update flight booking');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a flight booking by ID' })
  @ApiParam({
    name: 'id',
    description: 'Flight booking ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The flight booking has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Flight booking not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.flightBookingService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Flight booking with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.flightBookingService.logger.error(
        `Failed to delete flight booking with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete flight booking');
    }
  }
}
