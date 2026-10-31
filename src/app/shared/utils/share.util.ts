import { TEAMS_SHARE_PATH } from '@shared/constants/teams.constants';

export function shareLinkUrl(slug: string): string {
  return `${window.location.origin}${TEAMS_SHARE_PATH}/${slug}`;
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
