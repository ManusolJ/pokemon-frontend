import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TEAMS_SHARED_PATH } from '@shared/constants/teams.constants';

const LOGIN_PATH = '/auth/login';
const LIKED_LABEL = 'Unlike team';
const UNLIKED_LABEL = 'Like team';

@Component({
  imports: [],
  selector: 'app-like-button',
  styleUrl: './like-button.css',
  templateUrl: './like-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LikeButton {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly liked = input<boolean>(false);
  readonly size = input<'sm' | 'md'>('md');
  readonly count = input<number | null>(null);
  readonly teamId = input.required<number>();
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  readonly toggled = output<boolean>();

  protected readonly formattedCount = computed(() => {
    const value = this.count();
    if (value === null) {
      return null;
    }
    return value.toLocaleString();
  });

  protected readonly label = computed(() => (this.liked() ? LIKED_LABEL : UNLIKED_LABEL));

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isAuthenticated()) {
      this.router.navigate([LOGIN_PATH], {
        queryParams: { redirectTo: `${TEAMS_SHARED_PATH}/${this.teamId()}` },
      });
      return;
    }
    this.toggled.emit(!this.liked());
  }
}
