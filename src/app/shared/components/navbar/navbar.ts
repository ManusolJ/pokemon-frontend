import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { finalize } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { ROLE_ADMIN } from '@shared/constants/auth.constants';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = computed(() => this.tokenService.hasRole(ROLE_ADMIN));

  protected readonly items: readonly NavItem[] = [
    { label: 'Team Builder', path: '/team-builder' },
    { label: 'Pokedex', path: '/pokedex' },
    { label: 'Teams', path: '/teams' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  protected logout(): void {
    this.authService
      .logout()
      .pipe(finalize(() => this.router.navigate(['/auth/login'])))
      .subscribe({ error: () => {} });
  }
}
