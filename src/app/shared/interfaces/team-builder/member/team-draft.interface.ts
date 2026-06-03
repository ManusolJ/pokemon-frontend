import { TeamMember } from './team-member.interface';

export interface TeamDraft {
  readonly name: string;
  readonly isPrivate: boolean;
  readonly members: ReadonlyArray<TeamMember | null>;
  readonly sourceId: number | null;
}
