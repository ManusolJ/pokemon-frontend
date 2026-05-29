import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-auth-card',
  styleUrl: './auth-card.css',
  templateUrl: './auth-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCard {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
