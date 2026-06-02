import { ChangeDetectionStrategy, Component } from '@angular/core';

// INFO: This component is currently unused, but will be used in the future when the public team list feature is implemented.
// INFO: The public team list feature will allow users to browse and view teams created by other users. This component will be responsible for displaying the list of public teams available for users to view.
// INFO: It will include a search and filter functionality to help users find teams that match their interests, as well as pagination to handle large numbers of teams.
@Component({
  selector: 'app-public-team-list',
  imports: [],
  templateUrl: './public-team-list.html',
  styleUrl: './public-team-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicTeamList {}
