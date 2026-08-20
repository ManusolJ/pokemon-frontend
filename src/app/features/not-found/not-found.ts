import { RouterLink } from '@angular/router';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  imports: [RouterLink],
  selector: 'app-not-found',
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
