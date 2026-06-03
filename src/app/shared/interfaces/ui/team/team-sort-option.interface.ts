import { Pageable } from '@shared/interfaces/api/pageable.interface';

export interface TeamSortOption<TField extends string> {
  readonly id: string;
  readonly label: string;
  readonly field: TField;
  readonly direction: Pageable['direction'];
}
