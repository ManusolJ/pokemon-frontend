export interface Pageable {
  page: number;
  size: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}
