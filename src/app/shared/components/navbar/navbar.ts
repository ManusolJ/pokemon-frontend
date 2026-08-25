import { AUTHORITY_ADMIN } from '@shared/constants/auth.constants';

import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';

import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  inject,
  signal,
  computed,
  Component,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { filter } from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = computed(() => this.tokenService.hasRole(AUTHORITY_ADMIN));

  protected readonly menuOpen = signal(false);

  protected readonly items: readonly NavItem[] = [
    { label: 'Team Builder', path: '/team-builder' },
    { label: 'Pokedex', path: '/pokedex' },
    { label: 'Teams', path: '/teams' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout().subscribe({ error: () => {} });
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
