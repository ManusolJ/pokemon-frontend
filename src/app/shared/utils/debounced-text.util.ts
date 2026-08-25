import { DestroyRef, inject, Signal, signal } from '@angular/core';

export const SEARCH_DEBOUNCE_MS = 300;

export interface DebouncedText {
  readonly live: Signal<string>;
  readonly settled: Signal<string>;
  set(next: string): void;
  reset(): void;
}

export function debouncedText(
  onSettled?: () => void,
  delayMs: number = SEARCH_DEBOUNCE_MS,
): DebouncedText {
  const live = signal('');
  const settled = signal('');
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = (): void => clearTimeout(timer);

  inject(DestroyRef).onDestroy(cancel);

  return {
    live: live.asReadonly(),
    settled: settled.asReadonly(),
    set(next: string): void {
      live.set(next);
      cancel();
      timer = setTimeout(() => {
        settled.set(next);
        onSettled?.();
      }, delayMs);
    },
    reset(): void {
      cancel();
      live.set('');
      settled.set('');
    },
  };
}
