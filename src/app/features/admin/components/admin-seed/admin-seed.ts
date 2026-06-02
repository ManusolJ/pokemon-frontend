import { AdminService } from '@core/services/admin.service';

import { SeedLogRead } from '@shared/interfaces/pokemon/admin/seed-log-read.interface';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  inject,
  signal,
  computed,
  Component,
  OnDestroy,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';

type TriggerStatus = 'idle' | 'arming' | 'ready' | 'running' | 'done' | 'error';

const COUNTDOWN_TOTAL_SECONDS = 5;
const COUNTDOWN_TICK_MS = 1000;
const EMPTY_DATE_PLACEHOLDER = '—';
const DATETIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

@Component({
  imports: [],
  selector: 'app-admin-seed',
  styleUrl: './admin-seed.css',
  templateUrl: './admin-seed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSeed implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminService = inject(AdminService);

  protected readonly countdown = signal(0);
  protected readonly status = signal<TriggerStatus>('idle');
  protected readonly seedLog = signal<SeedLogRead | null>(null);

  protected readonly buttonLabel = computed(() => {
    switch (this.status()) {
      case 'arming':
        return `Wait ${this.countdown()}s…`;
      case 'ready':
        return 'Start seed';
      case 'running':
        return 'Seeding…';
      case 'done':
        return 'Done';
      default:
        return 'I understand. Continue.';
    }
  });

  protected readonly buttonDisabled = computed(() => {
    const current = this.status();
    return current === 'arming' || current === 'running' || current === 'done';
  });

  private countdownTimer: ReturnType<typeof setInterval> | undefined;

  ngOnDestroy(): void {
    this.clearCountdownTimer();
  }

  protected onTriggerClick(): void {
    const current = this.status();
    if (current === 'idle' || current === 'error') {
      this.arm();
      return;
    }
    if (current === 'ready') {
      this.run();
    }
  }

  protected formatDateTime(iso: string | null | undefined): string {
    if (!iso) {
      return EMPTY_DATE_PLACEHOLDER;
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return EMPTY_DATE_PLACEHOLDER;
    }
    return date.toLocaleString(undefined, DATETIME_FORMAT_OPTIONS);
  }

  private arm(): void {
    this.status.set('arming');
    this.countdown.set(COUNTDOWN_TOTAL_SECONDS);
    this.clearCountdownTimer();
    this.countdownTimer = setInterval(() => {
      const next = this.countdown() - 1;
      if (next <= 0) {
        this.clearCountdownTimer();
        this.countdown.set(0);
        this.status.set('ready');
        return;
      }
      this.countdown.set(next);
    }, COUNTDOWN_TICK_MS);
  }

  private run(): void {
    this.status.set('running');
    this.adminService
      .seed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (log) => {
          this.seedLog.set(log);
          this.status.set('done');
        },
        error: () => this.status.set('error'),
      });
  }

  private clearCountdownTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }
}
