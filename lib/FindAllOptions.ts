export interface FindAllOptions<T> {
  page?: number;
  limit?: number;
  filters?: Partial<T>;
  sort?: { field: keyof T; order: 'asc' | 'desc' };
}
