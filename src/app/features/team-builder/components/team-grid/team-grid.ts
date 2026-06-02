import { environment } from '@environments/environment';

import { TypeRead } from '@shared/interfaces/pokemon/type/type-read.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';

import { TypeBadge } from '@shared/components/type-badge/type-badge';

import { getTypeColor } from '@shared/utils/get-type-color.util';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  imports: [TypeBadge],
  selector: 'app-team-grid',
  styleUrl: './team-grid.css',
  templateUrl: './team-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamGrid {
  readonly members = input.required<ReadonlyArray<TeamMember | null>>();
  readonly activeIndex = input<number | null>(null);

  readonly slotAdd = output<number>();
  readonly slotSelect = output<number>();
  readonly slotRemove = output<number>();

  protected readonly filledCount = computed(() => this.members().filter((m) => m !== null).length);

  protected accentFor(member: TeamMember): string {
    return getTypeColor(member.primaryType.name);
  }

  protected typesOf(member: TeamMember): TypeRead[] {
    return [member.primaryType, member.secondaryType].filter(
      (type): type is TypeRead => !!type,
    );
  }

  protected displayNameFor(member: TeamMember): string {
    return member.nickname || member.name;
  }

  protected spriteFor(member: TeamMember): string {
    return member.shiny ? member.spriteShiny : member.spriteDefault;
  }

  protected onRemove(event: Event, index: number): void {
    event.stopPropagation();
    this.slotRemove.emit(index);
  }

  protected getImgUrl(url: string): string {
    return `${environment.spritesBaseUrl}${url}`;
  }
}
