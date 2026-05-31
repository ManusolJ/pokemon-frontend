import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-team-stats',
  imports: [],
  templateUrl: './team-stats.html',
  styleUrl: './team-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStats {}
