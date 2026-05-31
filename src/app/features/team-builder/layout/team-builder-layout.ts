import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { TabNav } from '@shared/components/tab-nav/tab-nav';

import { RouterOutlet } from '@angular/router';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [TabNav, RouterOutlet],
  selector: 'app-team-builder-layout',
  styleUrl: './team-builder-layout.css',
  templateUrl: './team-builder-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderLayout {
  protected readonly tabs: readonly NavItem[] = [
    { label: 'Builder', path: 'builder' },
    { label: 'Analysis', path: 'analysis' },
  ];
}
