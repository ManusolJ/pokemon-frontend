import { NavItem } from '@shared/interfaces/ui/generic/nav-item.interface';

import { TabNav } from '@shared/components/tab-nav/tab-nav';

import { RouterOutlet } from '@angular/router';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [RouterOutlet, TabNav],
  selector: 'app-pokedex-layout',
  styleUrl: './pokedex-layout.css',
  templateUrl: './pokedex-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexLayout {
  protected readonly tabs: NavItem[] = [
    { label: 'Pokemon', path: 'pokemon' },
    { label: 'Moves', path: 'moves' },
    { label: 'Type Chart', path: 'type-chart' },
    { label: 'Natures', path: 'natures' },
    { label: 'Abilities', path: 'abilities' },
    { label: 'Items', path: 'items' },
  ];
}
