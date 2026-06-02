import { RoleInfo } from './role-info.interface';

import { TeamMember } from '@shared/interfaces/team-builder/team-member.interface';

export interface RoleGroup {
  readonly role: RoleInfo;
  readonly members: readonly TeamMember[];
}
