import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-team-grid',
  imports: [],
  templateUrl: './team-grid.html',
  styleUrl: './team-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamGrid {}
