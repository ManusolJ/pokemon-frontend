export interface SeedLogRead {
  id: number;
  status: string;
  triggeredBy: string;
  startedAt: string;
  completedAt: string | null;
  entriesAdded: number;
  errors: number;
}
