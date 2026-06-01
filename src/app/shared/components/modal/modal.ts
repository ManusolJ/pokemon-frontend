import {
  input,
  output,
  computed,
  Component,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  imports: [],
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly open = input.required<boolean>();
  readonly title = input.required<string>();
  readonly dismissable = input<boolean>(true);

  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open() && this.dismissable()) this.closed.emit();
  }

  protected onBackdropClick(): void {
    if (this.dismissable()) this.closed.emit();
  }

  protected emitClose(): void {
    this.closed.emit();
  }
}
