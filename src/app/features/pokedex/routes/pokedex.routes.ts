import { PokedexLayout } from '@features/pokedex/layout/pokedex-layout';

import { Routes } from '@angular/router';

export const POKEDEX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/pokedex/layout/pokedex-layout').then((mod) => mod.PokedexLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pokemon',
      },
      {
        path: 'pokemon',
        loadComponent: () =>
          import('@features/pokedex/components/list/pokemon-list/pokemon-list').then(
            (mod) => mod.PokemonList,
          ),
      },
      {
        path: 'pokemon/:id',
        loadComponent: () =>
          import('@features/pokedex/components/detail/pokemon-detail/pokemon-detail').then(
            (mod) => mod.PokemonDetail,
          ),
      },
      {
        path: 'type-chart',
        loadComponent: () =>
          import('@features/pokedex/components/type-chart/type-chart').then((mod) => mod.TypeChart),
      },
      {
        path: 'natures',
        loadComponent: () =>
          import('@features/pokedex/components/list/nature-list/nature-list').then(
            (mod) => mod.NatureList,
          ),
      },
      {
        path: 'abilities',
        loadComponent: () =>
          import('@features/pokedex/components/list/ability-list/ability-list').then(
            (mod) => mod.AbilityList,
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('@features/pokedex/components/list/item-list/item-list').then(
            (mod) => mod.ItemList,
          ),
      },
      {
        path: 'moves',
        loadComponent: () =>
          import('@features/pokedex/components/list/move-list/move-list').then(
            (mod) => mod.MoveList,
          ),
      },
    ],
  },
];
