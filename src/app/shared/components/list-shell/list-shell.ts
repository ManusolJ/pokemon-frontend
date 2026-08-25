import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
  imports: [PaginatorModule],
  selector: 'app-list-shell',
  styleUrl: './list-shell.css',
  templateUrl: './list-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListShell {
  readonly loading = input<boolean>(false);
  readonly noun = input<string>('results');
  readonly title = input.required<string>();
  readonly total = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly hideSidebar = input<boolean>(false);

  readonly page = input.required<number>();

  readonly pageChange = output<number>();

  protected readonly sidebarOpen = signal(false);

  protected readonly skeletons = computed<readonly void[]>(() =>
    Array.from({ length: this.pageSize() }),
  );

  protected readonly isEmpty = computed(() => !this.loading() && this.total() === 0);

  protected readonly firstRecordIndex = computed(() => this.page() * this.pageSize());

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected onPageChange(event: PaginatorState): void {
    this.pageChange.emit(event.page ?? 0);
  }
}
