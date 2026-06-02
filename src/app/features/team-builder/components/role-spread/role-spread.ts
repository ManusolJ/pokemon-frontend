import { environment } from '@environments/environment';

import { RoleKey } from '@shared/interfaces/team-builder/role/role-key.interface';
import { RoleGroup } from '@shared/interfaces/team-builder/role/role-group.interface';
import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';

import { classifyRole } from '@shared/utils/role.util';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-role-spread',
  styleUrl: './role-spread.css',
  templateUrl: './role-spread.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSpread {
  readonly members = input.required<ReadonlyArray<TeamMember | null>>();

  protected readonly groups = computed<readonly RoleGroup[]>(() => this.bucketByRole());

  protected displayName(member: TeamMember): string {
    return member.nickname || member.name;
  }

  protected spriteFor(member: TeamMember): string {
    const path = member.shiny ? member.spriteShiny : member.spriteDefault;
    return `${environment.spritesBaseUrl}${path}`;
  }

  private bucketByRole(): readonly RoleGroup[] {
    const buckets = new Map<RoleKey, RoleGroup>();

    for (const member of this.members()) {
      if (!member) {
        continue;
      }
      const role = classifyRole(member);
      const existing = buckets.get(role.key);
      if (existing) {
        existing.members.push(member);
      } else {
        buckets.set(role.key, { role, members: [member] });
      }
    }

    return Array.from(buckets.values()).sort((a, b) => b.members.length - a.members.length);
  }
}
