export interface Page<T> {
  content: T[];
  page: PageMetadata;
}

interface PageMetadata {
  size: number;
  number: number;
  totalPages: number;
  totalElements: number;
}
