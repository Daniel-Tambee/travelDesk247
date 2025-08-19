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
import { AgentService } from './agent.service';
import { BaseDto } from 'lib/BaseDto';
import { BaseUpdateDto } from 'lib/BaseUpdateDto';
import { FindAllOptions } from 'lib/FindAllOptions';
import { Agent } from '@prisma/client';

@ApiTags('agents')
@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /*   @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new agent' })
  @ApiResponse({
    status: 201,
    description: 'The agent has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async create(@Body(ValidationPipe) createAgentDto: BaseDto): Promise<Agent> {
    try {
      return await this.agentService.create(createAgentDto);
    } catch (error) {
      this.agentService.logger.error('Failed to create agent', error);
      throw new InternalServerErrorException('Failed to create agent');
    }
  }
 */
  @Get()
  @ApiOperation({ summary: 'Get all agents' })
  @ApiResponse({
    status: 200,
    description: 'List of all agents.',
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
    @Query('sortField') sortField?: keyof Agent,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<Agent[]> {
    try {
      const options: FindAllOptions<Agent> = {
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
      return await this.agentService.findAll(options);
    } catch (error) {
      this.agentService.logger.error('Failed to fetch agents', error);
      throw new InternalServerErrorException('Failed to fetch agents');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an agent by ID' })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The agent with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Agent not found.',
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Agent> {
    try {
      const agent = await this.agentService.findById(id);
      if (!agent) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
      return agent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.agentService.logger.error(
        `Failed to fetch agent with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch agent');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an agent by ID' })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'The agent has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Agent not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  async updateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateAgentDto: BaseUpdateDto<Agent>,
  ): Promise<Agent> {
    try {
      return await this.agentService.updateById(id, updateAgentDto);
    } catch (error) {
      this.agentService.logger.error(
        `Failed to update agent with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update agent');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agent by ID' })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'The agent has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Agent not found.',
  })
  async deleteById(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    try {
      const deleted = await this.agentService.deleteById(id);
      if (!deleted) {
        throw new NotFoundException(`Agent with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.agentService.logger.error(
        `Failed to delete agent with ID ${id}`,
        error,
      );
      throw new InternalServerErrorException('Failed to delete agent');
    }
  }
}
