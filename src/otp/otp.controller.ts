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
import { OtpService } from './otp.service';
import { OtpCode } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { OtpValidateDto } from './OtpValidateDto';

@ApiTags('otp-codes')
@Controller('otp-codes')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  /* @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new OTP code' })
  @ApiResponse({
    status: 201,
    description: 'The OTP code has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createOtpCodeDto: BaseDto,
  ): Promise<OtpCode> {
    try {
      return await this.otpService.create(createOtpCodeDto);
    } catch (error) {
      this.otpService.logger.error('Failed to create OTP code', error);
      throw new InternalServerErrorException('Failed to create OTP code');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all OTP codes' })
  @ApiResponse({
    status: 200,
    description: 'List of all OTP codes.',
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
    @Query('sortField') sortField?: keyof OtpCode,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<OtpCode[]> {
    try {
      const options: FindAllOptions<OtpCode> = {
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
      return await this.otpService.findAll(options);
    } catch (error) {
      this.otpService.logger.error('Failed to fetch OTP codes', error);
      throw new InternalServerErrorException('Failed to fetch OTP codes');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an OTP code by ID' })
  @ApiParam({
    name: 'id',
    description: 'OTP code ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The OTP code with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'OTP code not found.',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<OtpCode> {
    try {
      const otpCode = await this.otpService.findById(id);
      if (!otpCode) {
        throw new NotFoundException(`OTP code with ID ${id} not found`);
      }
      return otpCode;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.otpService.logger.error(
        `Failed to fetch OTP code with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch OTP code');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an OTP code by ID' })
  @ApiParam({
    name: 'id',
    description: 'OTP code ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The OTP code has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'OTP code not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateOtpCodeDto: BaseUpdateDto<OtpCode>,
  ): Promise<OtpCode> {
    try {
      return await this.otpService.updateById(id, updateOtpCodeDto);
    } catch (error) {
      this.otpService.logger.error(
        `Failed to update OTP code with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update OTP code');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an OTP code by ID' })
  @ApiParam({
    name: 'id',
    description: 'OTP code ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The OTP code has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'OTP code not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.otpService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`OTP code with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.otpService.logger.error(
        `Failed to delete OTP code with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete OTP code');
    }
  } */

  // New endpoint to find and validate an OTP code
  @Post('validate')
  @ApiOperation({ summary: 'Find and validate a valid OTP code' })
  @ApiResponse({
    status: 200,
    description: 'Returns the valid OTP code.',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'OTP code not found or is invalid.',
  })
  async findValidOtp(
    @Body(ValidationPipe)
    validateOtpDto: OtpValidateDto,
  ): Promise<OtpCode | null> {
    try {
      const otpCode = await this.otpService.findValidOtp(
        validateOtpDto.userId,
        validateOtpDto.type,
        validateOtpDto.code,
      );
      if (!otpCode) {
        throw new NotFoundException('OTP code not found or is invalid');
      }
      return otpCode;
    } catch (error) {
      this.otpService.logger.error('Failed to validate OTP code', error);
      throw new InternalServerErrorException('Failed to validate OTP code');
    }
  }

  // New endpoint to mark an OTP code as verified
  @Put(':id/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark an OTP code as verified' })
  @ApiParam({
    name: 'id',
    description: 'OTP code ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The OTP code has been successfully marked as verified.',
  })
  @ApiResponse({
    status: 404,
    description: 'OTP code not found.',
  })
  async markAsVerified(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const isVerified = await this.otpService.markAsVerified(id);
      if (!isVerified) {
        throw new NotFoundException(`OTP code with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.otpService.logger.error(
        `Failed to mark OTP with ID ${id} as verified`,
        error,
      );
      throw new InternalServerErrorException('Failed to mark OTP as verified');
    }
  }
}
