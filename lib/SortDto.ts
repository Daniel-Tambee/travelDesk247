import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  IsIn,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SortDto<T> {
  @ApiPropertyOptional({ description: 'Field to sort by', type: String })
  @IsString()
  field: keyof T;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc';
}

export class FindAllDto<T> {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filters object', type: Object })
  @IsOptional()
  @IsObject()
  filters?: Partial<T>;

  @ApiPropertyOptional({ description: 'Sorting options', type: () => SortDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SortDto)
  sort?: SortDto<T>;
}
