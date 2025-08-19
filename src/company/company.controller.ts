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
import { CompanyService } from './company.service';
import { Company } from '@prisma/client';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'The company has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(
    @Body(ValidationPipe) createCompanyDto: BaseDto,
  ): Promise<Company> {
    try {
      return await this.companyService.create(createCompanyDto);
    } catch (error) {
      this.companyService.logger.error('Failed to create company', error);
      throw new InternalServerErrorException('Failed to create company');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'List of all companies.',
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
    @Query('sortField') sortField?: keyof Company,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<Company[]> {
    try {
      const options: FindAllOptions<Company> = {
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
      return await this.companyService.findAll(options);
    } catch (error) {
      this.companyService.logger.error('Failed to fetch companies', error);
      throw new InternalServerErrorException('Failed to fetch companies');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The company with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Company> {
    try {
      const company = await this.companyService.findById(id);
      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.companyService.logger.error(
        `Failed to fetch company with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch company');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company by ID' })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The company has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCompanyDto: BaseUpdateDto<Company>,
  ): Promise<Company> {
    try {
      return await this.companyService.updateById(id, updateCompanyDto);
    } catch (error) {
      this.companyService.logger.error(
        `Failed to update company with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update company');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a company by ID' })
  @ApiParam({
    name: 'id',
    description: 'Company ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The company has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.companyService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.companyService.logger.error(
        `Failed to delete company with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete company');
    }
  }
}
