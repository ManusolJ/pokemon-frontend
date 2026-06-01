import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { TabNav } from '@shared/components/tab-nav/tab-nav';

import { RouterOutlet } from '@angular/router';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [RouterOutlet, TabNav],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly tabs: readonly NavItem[] = [
    { label: 'Users', path: 'users', icon: 'pi-users' },
    { label: 'Seed', path: 'seed', icon: 'pi-database' },
    { label: 'Logs', path: 'logs', icon: 'pi-history' },
  ];
}
