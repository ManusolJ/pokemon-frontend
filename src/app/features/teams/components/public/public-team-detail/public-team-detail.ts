import { ChangeDetectionStrategy, Component } from '@angular/core';

// INFO: This component is currently unused, but will be used in the future when the public team detail feature is implemented.
// INFO: The public team detail feature will allow users to view the details of a specific public team without being able to modify it. It include buttons to open pass into the team builder
// TODO: Create the detail reusable component for both public and private teams once the feature is ready.
@Component({
  selector: 'app-public-team-detail',
  imports: [],
  templateUrl: './public-team-detail.html',
  styleUrl: './public-team-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicTeamDetail {}
