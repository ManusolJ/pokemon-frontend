import { TEAMS_SHARED_PATH } from '@shared/constants/teams.constants';

export function publicTeamUrl(teamId: number): string {
  return `${window.location.origin}${TEAMS_SHARED_PATH}/${teamId}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
