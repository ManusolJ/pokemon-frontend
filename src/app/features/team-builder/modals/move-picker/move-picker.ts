import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-move-picker',
  imports: [],
  templateUrl: './move-picker.html',
  styleUrl: './move-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovePicker {}
