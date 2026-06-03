export type VisibilityTabId = 'all' | 'public' | 'private';

export interface VisibilityTab {
  readonly id: VisibilityTabId;
  readonly label: string;
  readonly isPublic: boolean | undefined;
}
