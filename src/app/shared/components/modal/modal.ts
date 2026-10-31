import {
  input,
  output,
  effect,
  viewChild,
  Component,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly dismissable = input<boolean>(true);
  readonly size = input<'sm' | 'lg'>('lg');

  readonly closed = output<void>();

  protected readonly titleId = `modal-title-${nextId++}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private opener: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;

      if (this.open() && !dialog.open) {
        this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
        if (this.opener?.isConnected) {
          this.opener.focus();
        }
        this.opener = null;
      }
    });
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    if (this.dismissable()) {
      this.closed.emit();
    }
  }

  protected onDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.dismissable()) {
      this.closed.emit();
    }
  }

  protected emitClose(): void {
    this.closed.emit();
  }
}
