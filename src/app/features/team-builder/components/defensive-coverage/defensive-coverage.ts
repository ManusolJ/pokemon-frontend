import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-defensive-coverage',
  imports: [],
  templateUrl: './defensive-coverage.html',
  styleUrl: './defensive-coverage.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefensiveCoverage {}
