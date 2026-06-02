import { ChangeDetectionStrategy, Component } from '@angular/core';

// INFO: This component is currently unused, but will be used in the future when the team card feature is implemented.
// INFO: The team card component will be a reusable component that displays a summary of a team, including its name, creator, and a preview of the Pokémon in the team. It will be used in both the public and private team lists to provide a consistent and visually appealing way to display teams.
// INFO: It will have quick actions button for viewing and liking teams.
@Component({
  selector: 'app-team-card',
  imports: [],
  templateUrl: './team-card.html',
  styleUrl: './team-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamCard {}
