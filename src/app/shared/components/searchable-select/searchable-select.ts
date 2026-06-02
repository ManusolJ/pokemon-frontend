import { environment } from '@environments/environment';

import { SearchableOption } from '@shared/interfaces/ui/generic/searchable-option.interface';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import {
  input,
  output,
  signal,
  inject,
  computed,
  Component,
  ElementRef,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  imports: [NameNormalizerPipe],
  selector: 'app-searchable-select',
  styleUrl: './searchable-select.css',
  templateUrl: './searchable-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchableSelect {
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly label = input<string>();
  readonly disabled = input<boolean>(false);
  readonly clearable = input<boolean>(true);
  readonly capitalize = input<boolean>(false);
  readonly placeholder = input<string>('Select…');
  readonly value = input<string | number | null>(null);
  readonly searchPlaceholder = input<string>('Type to filter…');
  readonly options = input.required<readonly SearchableOption[]>();

  readonly valueChange = output<string | number | null>();

  protected readonly open = signal(false);
  protected readonly query = signal('');

  protected readonly selected = computed<SearchableOption | null>(() => {
    const v = this.value();
    if (v === null || v === undefined) {
      return null;
    }
    return this.options().find((o) => o.value === v) ?? null;
  });

  protected readonly filtered = computed<readonly SearchableOption[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
      this.query.set('');
    }
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onSearch(raw: string): void {
    this.query.set(raw);
  }

  protected pick(option: SearchableOption): void {
    this.valueChange.emit(option.value);
    this.close();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.valueChange.emit(null);
    this.close();
  }

  @HostListener('document:mousedown', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    if (!this.hostRef.nativeElement.contains(event.target as Node)) this.close();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  protected getImgUrl(url: string): string {
    return `${environment.spritesBaseUrl}${url}`;
  }
}
