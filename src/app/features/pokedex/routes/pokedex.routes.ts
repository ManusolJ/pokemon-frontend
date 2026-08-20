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
        title: 'Pokédex',
        data: {
          description:
            'Browse all 1,025 Pokémon. Filter by name, type, generation, evolution method or base stat range, and open any entry for its full competitive profile.',
        },
        loadComponent: () =>
          import('@features/pokedex/components/list/pokemon-list/pokemon-list').then(
            (mod) => mod.PokemonList,
          ),
      },
      {
        path: 'pokemon/:id',
        title: 'Pokémon',
        loadComponent: () =>
          import('@features/pokedex/components/detail/pokemon-detail/pokemon-detail').then(
            (mod) => mod.PokemonDetail,
          ),
      },
      {
        path: 'type-chart',
        title: 'Type Chart',
        data: {
          description:
            'An interactive Pokémon type effectiveness chart covering all 18 types, including dual-type defensive match-ups.',
        },
        loadComponent: () =>
          import('@features/pokedex/components/type-chart/type-chart').then((mod) => mod.TypeChart),
      },
      {
        path: 'natures',
        title: 'Natures',
        data: { description: 'All 25 Pokémon natures and the stats each one raises and lowers.' },
        loadComponent: () =>
          import('@features/pokedex/components/list/nature-list/nature-list').then(
            (mod) => mod.NatureList,
          ),
      },
      {
        path: 'abilities',
        title: 'Abilities',
        data: { description: 'Every Pokémon ability with its in-battle effect, searchable by name.' },
        loadComponent: () =>
          import('@features/pokedex/components/list/ability-list/ability-list').then(
            (mod) => mod.AbilityList,
          ),
      },
      {
        path: 'items',
        title: 'Items',
        data: { description: 'Competitively relevant held items and berries, with their effects and categories.' },
        loadComponent: () =>
          import('@features/pokedex/components/list/item-list/item-list').then(
            (mod) => mod.ItemList,
          ),
      },
      {
        path: 'moves',
        title: 'Moves',
        data: {
          description:
            'All 919 Pokémon moves with type, category, power, accuracy and PP. Filter by type, category or power range.',
        },
        loadComponent: () =>
          import('@features/pokedex/components/list/move-list/move-list').then(
            (mod) => mod.MoveList,
          ),
      },
      {
        path: 'moves/:id',
        title: 'Move',
        loadComponent: () =>
          import('@features/pokedex/components/detail/move-detail/move-detail').then(
            (mod) => mod.MoveDetail,
          ),
      },
    ],
  },
];
