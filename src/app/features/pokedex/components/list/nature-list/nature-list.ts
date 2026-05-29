import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-nature-list',
  imports: [],
  templateUrl: './nature-list.html',
  styleUrl: './nature-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NatureList {}
