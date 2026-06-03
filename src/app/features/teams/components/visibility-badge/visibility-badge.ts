import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PUBLIC_LABEL = 'Public';
const PRIVATE_LABEL = 'Private';

@Component({
  imports: [],
  selector: 'app-visibility-badge',
  styleUrl: './visibility-badge.css',
  templateUrl: './visibility-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisibilityBadge {
  readonly isPublic = input.required<boolean>();
  readonly size = input<'sm' | 'md'>('md');

  protected readonly label = computed(() => (this.isPublic() ? PUBLIC_LABEL : PRIVATE_LABEL));
}
