import { Logger } from '@nestjs/common';
import { BaseDto } from './BaseDto';
import { BaseUpdateDto } from './BaseUpdateDto';
import { FindAllOptions } from './FindAllOptions';
import { DbService } from 'src/db/db.service';

export interface ICommon<T, U extends BaseDto, V extends BaseUpdateDto<T>> {
  logger: Logger;
  db: DbService;
  create(properties: U): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(options?: FindAllOptions<T>): Promise<Array<T>>;
  updateById(id: string, properties: V): Promise<T>;
  deleteById(id: string): Promise<boolean>;
}
