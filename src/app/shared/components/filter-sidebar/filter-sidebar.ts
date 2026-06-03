import {
  FilterField,
  FilterScalar,
  FilterValue,
  FilterOption,
} from '@shared/interfaces/ui/filter/filter-field.interface';

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

const EMIT_DEBOUNCE_MS = 300;

const DEFAULT_CHIP_ACCENT = 'var(--color-brand-muted)';

type FilterState = Record<string, FilterValue | undefined>;

// TODO: Store active filter state in memory to preserve between page changes.
@Component({
  imports: [],
  selector: 'app-filter-sidebar',
  styleUrl: './filter-sidebar.css',
  templateUrl: './filter-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSidebar {
  protected readonly state = signal<FilterState>({});

  readonly fields = input.required<readonly FilterField[]>();
  readonly filterChange = output<Record<string, FilterValue>>();

  private emitTimer: ReturnType<typeof setTimeout> | undefined;

  protected activeCount(): number {
    return Object.values(this.state()).filter(isApplied).length;
  }

  protected currentValue(key: string | undefined): FilterValue | undefined {
    return key ? this.state()[key] : undefined;
  }

  protected isChipActive(field: FilterField, option: FilterOption): boolean {
    if (!field.key) {
      return false;
    }
    const current = this.state()[field.key];
    if (field.multi) {
      return Array.isArray(current) && current.includes(option.value);
    }
    return current == option.value;
  }

  protected toggleChip(field: FilterField, option: FilterOption): void {
    if (!field.key) {
      return;
    }

    if (!field.multi) {
      const isAlreadySelected = this.state()[field.key] === option.value;
      this.patch({ [field.key]: isAlreadySelected ? undefined : option.value });
      return;
    }

    const current = this.state()[field.key];
    const selected: FilterScalar[] = Array.isArray(current) ? [...current] : [];
    const index = selected.indexOf(option.value);

    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      if (field.maxSelections !== undefined && selected.length >= field.maxSelections) {
        return;
      }
      selected.push(option.value);
    }

    this.patch({ [field.key]: selected.length > 0 ? selected : undefined });
  }

  protected onSearch(field: FilterField, rawValue: string): void {
    if (!field.key) {
      return;
    }
    this.patch({ [field.key]: rawValue.trim() || undefined }, { debounce: true });
  }

  protected onSelect(field: FilterField, rawValue: string): void {
    if (!field.key) return;
    const selected = field.options?.find((option) => String(option.value) === rawValue);
    this.patch({ [field.key]: selected ? selected.value : rawValue || undefined });
  }

  protected onRange(field: FilterField, bound: 'min' | 'max', rawValue: string): void {
    const key = bound === 'min' ? field.minKey : field.maxKey;
    if (!key) return;
    const parsed = Number(rawValue);
    const value = rawValue !== '' && Number.isFinite(parsed) ? parsed : undefined;
    this.patch({ [key]: value }, { debounce: true });
  }

  protected onToggle(field: FilterField): void {
    if (!field.key) return;
    const isOn = !!this.state()[field.key];
    this.patch({ [field.key]: isOn ? undefined : true });
  }

  protected reset(): void {
    this.state.set({});
    this.emitNow();
  }

  protected accent(option: FilterOption): string {
    return option.color ?? DEFAULT_CHIP_ACCENT;
  }

  private patch(changes: FilterState, { debounce = false } = {}): void {
    this.state.update((current) => ({ ...current, ...changes }));
    if (debounce) {
      this.scheduleEmit();
    } else {
      this.emitNow();
    }
  }

  private scheduleEmit(): void {
    clearTimeout(this.emitTimer);
    this.emitTimer = setTimeout(() => this.emit(), EMIT_DEBOUNCE_MS);
  }

  private emitNow(): void {
    clearTimeout(this.emitTimer);
    this.emit();
  }

  private emit(): void {
    const applied: Record<string, FilterValue> = {};
    for (const [key, value] of Object.entries(this.state())) {
      if (isApplied(value)) applied[key] = value;
    }
    this.filterChange.emit(applied);
  }
}

function isApplied(value: FilterValue | undefined): value is FilterValue {
  if (value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
