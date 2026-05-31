import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pokemon-picker',
  imports: [],
  templateUrl: './pokemon-picker.html',
  styleUrl: './pokemon-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonPicker {}
