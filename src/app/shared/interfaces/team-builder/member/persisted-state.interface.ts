import { TeamMember } from './team-member.interface';

export interface PersistedState {
  readonly teamName: string;
  readonly isPrivate: boolean;
  readonly activeIndex: number | null;
  readonly members: ReadonlyArray<TeamMember | null>;
}
