import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-modal',
  host: { '(document:keydown.escape)': 'onEscape()' },
  styleUrl: './modal.css',
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly dismissable = input<boolean>(true);

  readonly closed = output<void>();

  protected onEscape(): void {
    if (this.open() && this.dismissable()) {
      this.closed.emit();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.dismissable()) {
      this.closed.emit();
    }
  }

  protected emitClose(): void {
    this.closed.emit();
  }
}
