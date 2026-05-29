import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-list-shell',
  styleUrl: './list-shell.css',
  templateUrl: './list-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListShell {
  readonly total = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly noun = input<string>('results');
  readonly title = input.required<string>();
  readonly skeletonCount = input.required<number>();

  readonly page = input<number>(0);
  readonly totalPages = input<number>(0);

  readonly pageChange = output<number>();

  protected readonly skeletons = computed<readonly void[]>(() =>
    Array.from({ length: this.skeletonCount() }),
  );

  protected readonly hasPreviousPage = computed(() => this.page() > 0);
  protected readonly isEmpty = computed(() => !this.loading() && this.total() === 0);
  protected readonly hasNextPage = computed(() => this.page() < this.totalPages() - 1);

  protected goToPreviousPage(): void {
    if (this.hasPreviousPage()) this.pageChange.emit(this.page() - 1);
  }

  protected goToNextPage(): void {
    if (this.hasNextPage()) this.pageChange.emit(this.page() + 1);
  }
}
