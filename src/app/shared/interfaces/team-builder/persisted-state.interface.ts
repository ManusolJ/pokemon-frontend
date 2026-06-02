import { TeamMember } from './team-member.interface';

export interface PersistedState {
  readonly teamName: string;
  readonly isPrivate: boolean;
  readonly members: ReadonlyArray<TeamMember | null>;
  readonly activeIndex: number | null;
}
