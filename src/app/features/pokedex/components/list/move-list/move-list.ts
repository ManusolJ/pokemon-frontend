import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-move-list',
  imports: [],
  templateUrl: './move-list.html',
  styleUrl: './move-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveList {}
