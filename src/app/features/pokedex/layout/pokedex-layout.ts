import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NavItem } from '@shared/interfaces/ui/nav-item.interface';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-pokedex-layout',
  styleUrl: './pokedex-layout.css',
  templateUrl: './pokedex-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexLayout {
  protected readonly items: NavItem[] = [
    { label: 'Pokemon', path: 'pokemon' },
    { label: 'Type Chart', path: 'type-chart' },
    { label: 'Natures', path: 'natures' },
    { label: 'Abilities', path: 'abilities' },
    { label: 'Items', path: 'items' },
    { label: 'Moves', path: 'moves' },
  ];
}
