import { spriteUrl } from '@shared/utils/sprite-url.util';

import { SearchableOption } from '@shared/interfaces/ui/generic/searchable-option.interface';

import { NameNormalizerPipe } from '@shared/pipes/name-normalizer.pipe';

import {
  input,
  output,
  signal,
  inject,
  computed,
  viewChild,
  Component,
  ElementRef,
  afterNextRender,
  Injector,
  ChangeDetectionStrategy,
} from '@angular/core';

let nextId = 0;

@Component({
  imports: [NameNormalizerPipe],
  selector: 'app-searchable-select',
  host: {
    '(document:mousedown)': 'onDocumentClick($event)',
  },
  styleUrl: './searchable-select.css',
  templateUrl: './searchable-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchableSelect {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  readonly label = input<string>();
  readonly disabled = input<boolean>(false);
  readonly clearable = input<boolean>(true);
  readonly capitalize = input<boolean>(false);
  readonly placeholder = input<string>('Select…');
  readonly value = input<string | number | null>(null);
  readonly searchPlaceholder = input<string>('Type to filter…');
  readonly options = input.required<readonly SearchableOption[]>();

  readonly valueChange = output<string | number | null>();

  protected readonly id = `select-${nextId++}`;
  protected readonly labelId = `${this.id}-label`;
  protected readonly valueId = `${this.id}-value`;
  protected readonly listId = `${this.id}-list`;

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

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

  protected readonly activeOptionId = computed<string | null>(() =>
    this.filtered().length > 0 ? this.optionId(this.activeIndex()) : null,
  );

  protected optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const count = this.filtered().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(count === 0 ? 0 : (this.activeIndex() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(count === 0 ? 0 : (this.activeIndex() - 1 + count) % count);
        break;
      case 'Home':
        event.preventDefault();
        this.moveActive(0);
        break;
      case 'End':
        event.preventDefault();
        this.moveActive(Math.max(0, count - 1));
        break;
      case 'Enter': {
        event.preventDefault();
        const option = this.filtered()[this.activeIndex()];
        if (option) {
          this.pick(option);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close(true);
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  protected pick(option: SearchableOption): void {
    this.valueChange.emit(option.value);
    this.close(true);
  }

  protected clear(): void {
    this.valueChange.emit(null);
    this.close(true);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.hostRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  protected getImgUrl(url: string): string {
    return spriteUrl(url);
  }

  private openPanel(): void {
    this.query.set('');
    const current = this.options().findIndex((o) => o.value === this.value());
    this.activeIndex.set(Math.max(0, current));
    this.open.set(true);
    afterNextRender(
      () => {
        this.search()?.nativeElement.focus();
        this.scrollActiveIntoView();
      },
      { injector: this.injector },
    );
  }

  private close(returnFocus = false): void {
    this.open.set(false);
    if (returnFocus) {
      this.trigger().nativeElement.focus();
    }
  }

  private moveActive(index: number): void {
    this.activeIndex.set(index);
    afterNextRender(() => this.scrollActiveIntoView(), { injector: this.injector });
  }

  private scrollActiveIntoView(): void {
    const id = this.activeOptionId();
    if (id) {
      this.hostRef.nativeElement.querySelector(`#${id}`)?.scrollIntoView({ block: 'nearest' });
    }
  }
}
