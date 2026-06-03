export type FilterFieldKind = 'search' | 'chips' | 'select' | 'range' | 'toggle';

export type FilterScalar = string | number | boolean;
export type FilterValue = FilterScalar | readonly FilterScalar[];

export interface FilterOption {
  readonly label: string;
  readonly value: string | number;
  readonly color?: string;
}

export interface FilterField {
  readonly kind: FilterFieldKind;
  readonly label?: string;

  readonly key?: string;
  readonly placeholder?: string;

  readonly options?: readonly FilterOption[];

  readonly minKey?: string;
  readonly maxKey?: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;

  readonly multi?: boolean;
  readonly maxSelections?: number;
}
