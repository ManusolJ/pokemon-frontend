import { ChangeDetectionStrategy, Component } from '@angular/core';

// INFO: This component is currently unused, but will be used in the future when the private team list feature is implemented.
// INFO: The private team list feature will allow users to create and manage their own teams, which can be kept private or shared with others. This component will be responsible for displaying the list of private teams that a user has created.
// TODO: Implement with reusable list shell component once the feature is ready.
@Component({
  selector: 'app-private-team-list',
  imports: [],
  templateUrl: './private-team-list.html',
  styleUrl: './private-team-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateTeamList {}
