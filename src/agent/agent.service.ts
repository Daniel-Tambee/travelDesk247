import { Logger } from "@nestjs/common";
import { $Enums, Agent, AgentAccessLevel } from "@prisma/client";
import { BaseDto } from "lib/BaseDto";
import { BaseUpdateDto } from "lib/BaseUpdateDto";
import { FindAllOptions } from "lib/FindAllOptions";
import { ICommon } from "lib/ICommons.interface";
import { DbService } from "src/db/db.service";

export class AgentService implements ICommon<Agent, BaseDto, BaseUpdateDto<Agent>> {
  logger: Logger;
  db: DbService;

  constructor(logger: Logger, db: DbService) {
    this.logger = logger;
    this.db = db;
  }

  async create(
    properties: BaseDto,
  ): Promise<Agent> {
    try {
      this.logger.log('Creating new agent', { properties });
      
      const parsedData = this.parseAgentData(properties);
      
      const agent = await this.db.agent.create({
        data: {
          ...parsedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log('Agent created successfully', { agentId: agent.id });
      return agent;
    } catch (error) {
      this.logger.error('Failed to create agent', { error, properties });
      throw error;
    }
  }

  async findById(
    id: string,
  ): Promise<{
    id: string;
    userId: string;
    agentCode: string;
    department: string | null;
    accessLevel: $Enums.AgentAccessLevel;
    isActive: boolean;
    supervisorId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      this.logger.debug('Finding agent by ID', { id });
      
      const agent = await this.db.agent.findUnique({
        where: { id },
      });

      if (agent) {
        this.logger.debug('Agent found', { agentId: id });
      } else {
        this.logger.debug('Agent not found', { agentId: id });
      }

      return agent;
    } catch (error) {
      this.logger.error('Failed to find agent by ID', { error, id });
      throw error;
    }
  }

  async findAll(
    options?: FindAllOptions<{
      id: string;
      userId: string;
      agentCode: string;
      department: string | null;
      accessLevel: $Enums.AgentAccessLevel;
      isActive: boolean;
      supervisorId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> | undefined,
  ): Promise<
    {
      id: string;
      userId: string;
      agentCode: string;
      department: string | null;
      accessLevel: $Enums.AgentAccessLevel;
      isActive: boolean;
      supervisorId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[]
  > {
    try {
      this.logger.debug('Finding all agents', { options });

      // Build the query based on options
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

      const agents = await this.db.agent.findMany(queryOptions);

      this.logger.debug('Agents retrieved successfully', { 
        count: agents.length,
        page: options?.page,
        limit: options?.limit 
      });
      return agents;
    } catch (error) {
      this.logger.error('Failed to find all agents', { error, options });
      throw error;
    }
  }

  async updateById(
    id: string,
    properties: BaseUpdateDto<{
      id: string;
      userId: string;
      agentCode: string;
      department: string | null;
      accessLevel: $Enums.AgentAccessLevel;
      isActive: boolean;
      supervisorId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>,
  ): Promise<{
    id: string;
    userId: string;
    agentCode: string;
    department: string | null;
    accessLevel: $Enums.AgentAccessLevel;
    isActive: boolean;
    supervisorId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      this.logger.log('Updating agent', { id, properties });

      // Check if agent exists first
      const existingAgent = await this.db.agent.findUnique({
        where: { id },
      });

      if (!existingAgent) {
        const error = new Error(`Agent with ID ${id} not found`);
        this.logger.error('Agent not found for update', { id });
        throw error;
      }

      const parsedData = this.parseAgentData(properties);

      const updatedAgent = await this.db.agent.update({
        where: { id },
        data: {
          ...parsedData,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Agent updated successfully', { agentId: id });
      return updatedAgent;
    } catch (error) {
      this.logger.error('Failed to update agent', { error, id, properties });
      throw error;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      this.logger.log('Deleting agent', { id });

      // Check if agent exists first
      const existingAgent = await this.db.agent.findUnique({
        where: { id },
      });

      if (!existingAgent) {
        this.logger.warn('Agent not found for deletion', { id });
        return false;
      }

      await this.db.agent.delete({
        where: { id },
      });

      this.logger.log('Agent deleted successfully', { agentId: id });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete agent', { error, id });
      throw error;
    }
  }

  // Additional utility methods that might be useful for AgentService

  async findByUserId(userId: string): Promise<{
    id: string;
    userId: string;
    agentCode: string;
    department: string | null;
    accessLevel: $Enums.AgentAccessLevel;
    isActive: boolean;
    supervisorId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      this.logger.debug('Finding agent by user ID', { userId });
      
      const agent = await this.db.agent.findFirst({
        where: { userId },
      });

      return agent;
    } catch (error) {
      this.logger.error('Failed to find agent by user ID', { error, userId });
      throw error;
    }
  }

  async findByAgentCode(agentCode: string): Promise<{
    id: string;
    userId: string;
    agentCode: string;
    department: string | null;
    accessLevel: $Enums.AgentAccessLevel;
    isActive: boolean;
    supervisorId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      this.logger.debug('Finding agent by agent code', { agentCode });
      
      const agent = await this.db.agent.findFirst({
        where: { agentCode },
      });

      return agent;
    } catch (error) {
      this.logger.error('Failed to find agent by agent code', { error, agentCode });
      throw error;
    }
  }

  async findBySupervisorId(supervisorId: string): Promise<{
    id: string;
    userId: string;
    agentCode: string;
    department: string | null;
    accessLevel: AgentAccessLevel;
    isActive: boolean;
    supervisorId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[]> {
    try {
      this.logger.debug('Finding agents by supervisor ID', { supervisorId });
      
      const agents = await this.db.agent.findMany({
        where: { supervisorId },
      });

      return agents;
    } catch (error) {
      this.logger.error('Failed to find agents by supervisor ID', { error, supervisorId });
      throw error;
    }
  }

  async findActiveAgents(): Promise<{
    id: string;
    userId: string;
    agentCode: string;
    department: string | null;
    accessLevel: $Enums.AgentAccessLevel;
    isActive: boolean;
    supervisorId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[]> {
    try {
      this.logger.debug('Finding active agents');
      
      const agents = await this.db.agent.findMany({
        where: { isActive: true },
      });

      return agents;
    } catch (error) {
      this.logger.error('Failed to find active agents', { error });
      throw error;
    }
  }

  async updateAgentStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      this.logger.log('Updating agent status', { id, isActive });

      await this.db.agent.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });

      this.logger.log('Agent status updated successfully', { agentId: id, isActive });
      return true;
    } catch (error) {
      this.logger.error('Failed to update agent status', { error, id, isActive });
      throw error;
    }
  }

  // Data parsing methods for handling incoming string data
  private parseAgentData(data: any): any {
    const parsed = { ...data };

    // Parse boolean fields
    if (typeof parsed.isActive === 'string') {
      parsed.isActive = parsed.isActive === 'true' || parsed.isActive === '1';
    }

    // Parse access level enum
    if (typeof parsed.accessLevel === 'string') {
      // Validate against enum values if needed
      parsed.accessLevel = parsed.accessLevel as $Enums.AgentAccessLevel;
    }

    // Parse date fields if they come as strings
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    // Handle null values for optional string fields
    if (parsed.department === 'null' || parsed.department === '') {
      parsed.department = null;
    }

    if (parsed.supervisorId === 'null' || parsed.supervisorId === '') {
      parsed.supervisorId = null;
    }

    return parsed;
  }

  private parseFilters(filters: any): any {
    const parsed = { ...filters };

    // Parse boolean filters
    if (typeof parsed.isActive === 'string') {
      parsed.isActive = parsed.isActive === 'true' || parsed.isActive === '1';
    }

    // Parse access level enum filters
    if (typeof parsed.accessLevel === 'string') {
      parsed.accessLevel = parsed.accessLevel as $Enums.AgentAccessLevel;
    }

    // Parse date filters
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }

    if (typeof parsed.updatedAt === 'string') {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    // Handle null values for optional string fields
    if (parsed.department === 'null' || parsed.department === '') {
      parsed.department = null;
    }

    if (parsed.supervisorId === 'null' || parsed.supervisorId === '') {
      parsed.supervisorId = null;
    }

    // Handle date range filters (common use case)
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