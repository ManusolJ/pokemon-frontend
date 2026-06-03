import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { TabNav } from '@shared/components/tab-nav/tab-nav';

import { RouterOutlet } from '@angular/router';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [TabNav, RouterOutlet],
  selector: 'app-team-layout',
  styleUrl: './team-layout.css',
  templateUrl: './team-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamLayout {
  protected readonly items: NavItem[] = [
    { label: 'Shared Teams', path: 'shared-teams' },
    { label: 'My Teams', path: 'my-teams' },
  ];
}
