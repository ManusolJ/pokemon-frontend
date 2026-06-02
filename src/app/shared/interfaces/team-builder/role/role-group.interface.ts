import { TeamMember } from '@shared/interfaces/team-builder/member/team-member.interface';

import { RoleInfo } from './role-info.interface';

export interface RoleGroup {
  readonly role: RoleInfo;
  readonly members: TeamMember[];
}
