export interface Pageable {
  page: number;
  size: number;
  sort?: string;
  thenSort?: readonly string[];
  direction?: 'ASC' | 'DESC';
}
