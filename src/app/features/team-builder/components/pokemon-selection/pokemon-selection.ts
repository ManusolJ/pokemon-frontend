import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pokemon-selection',
  imports: [],
  templateUrl: './pokemon-selection.html',
  styleUrl: './pokemon-selection.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonSelection {}
