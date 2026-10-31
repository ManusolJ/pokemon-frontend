import { AUTHORITY_ADMIN } from '@shared/constants/auth.constants';

import { placeUnder } from '@shared/utils/popover.util';

import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { ThemeSwitch } from '@shared/components/theme-switch/theme-switch';

import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';

import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  inject,
  signal,
  computed,
  viewChild,
  Component,
  DestroyRef,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { filter } from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [RouterLink, RouterLinkActive, ThemeSwitch],
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

  private readonly accountTrigger = viewChild<ElementRef<HTMLElement>>('accountTrigger');
  private readonly accountMenu = viewChild<ElementRef<HTMLElement>>('accountMenu');

  protected readonly accountMenuId = 'account-menu';

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = computed(() => this.tokenService.hasRole(AUTHORITY_ADMIN));
  protected readonly username = this.tokenService.username;
  protected readonly initial = computed(() => (this.username() ?? '?').charAt(0).toUpperCase());

  protected readonly menuOpen = signal(false);

  protected readonly items: readonly NavItem[] = [
    { label: 'Team Builder', path: '/team-builder' },
    { label: 'Pokédex', path: '/pokedex' },
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

  protected placeAccountMenu(): void {
    const trigger = this.accountTrigger()?.nativeElement;
    const menu = this.accountMenu()?.nativeElement;
    if (trigger && menu) {
      placeUnder(trigger, menu);
    }
  }

  protected hideAccountMenu(): void {
    this.accountMenu()?.nativeElement.hidePopover();
  }

  protected logout(): void {
    this.hideAccountMenu();
    this.closeMenu();
    this.authService.signOut();
    void this.router.navigate(['/']);
  }
}
