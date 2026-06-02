import { ChangeDetectionStrategy, Component } from '@angular/core';

// INFO: This component is currently unused, but will be used in the future when the private team detail feature is implemented.
// INFO: The private team detail feature will allow users to view the details of a specific private team.
//TODO: Create the detail reusable component for both public and private teams once the feature is ready.
@Component({
  selector: 'app-private-team-detail',
  imports: [],
  templateUrl: './private-team-detail.html',
  styleUrl: './private-team-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateTeamDetail {}
