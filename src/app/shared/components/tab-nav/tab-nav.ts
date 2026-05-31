import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-tab-nav',
  styleUrl: './tab-nav.css',
  templateUrl: './tab-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabNav {
  readonly items = input.required<readonly NavItem[]>();
  readonly ariaLabel = input<string>('Sections');
}
