import { pageParam } from '@shared/utils/url-page.util';

import { RouterLink } from '@angular/router';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Page numbers shown around the current one (plus the first and last). */
const WINDOW_SIZE = 5;

type PagerEntry = { readonly kind: 'page'; readonly index: number } | { readonly kind: 'gap'; readonly key: string };

/**
 * Pagination as plain links to `?page=N` (see urlPage), so every list page has a crawlable URL.
 * The list reads the page back from the URL; this component only renders links.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-pager',
  styleUrl: './pager.css',
  templateUrl: './pager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pager {
  /** 0-based. */
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly totalPages = input.required<number>();

  protected readonly first = computed(() => this.page() * this.pageSize() + 1);
  protected readonly last = computed(() => Math.min(this.total(), (this.page() + 1) * this.pageSize()));

  protected readonly entries = computed<PagerEntry[]>(() => {
    const count = this.totalPages();
    const current = this.page();
    const half = Math.floor(WINDOW_SIZE / 2);
    const start = Math.max(0, Math.min(current - half, count - WINDOW_SIZE));
    const end = Math.min(count - 1, start + WINDOW_SIZE - 1);

    const entries: PagerEntry[] = [];
    if (start > 0) {
      entries.push({ kind: 'page', index: 0 });
      if (start > 1) {
        entries.push({ kind: 'gap', key: 'start' });
      }
    }
    for (let index = start; index <= end; index++) {
      entries.push({ kind: 'page', index });
    }
    if (end < count - 1) {
      if (end < count - 2) {
        entries.push({ kind: 'gap', key: 'end' });
      }
      entries.push({ kind: 'page', index: count - 1 });
    }
    return entries;
  });

  protected params(index: number): { page: number | null } {
    return { page: pageParam(index) };
  }
}
