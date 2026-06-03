import { PrivateTeamCardAction } from './private-team-card-action.interface';

export interface PrivateTeamCardActionEvent {
  readonly id: number;
  readonly kind: PrivateTeamCardAction;
}
