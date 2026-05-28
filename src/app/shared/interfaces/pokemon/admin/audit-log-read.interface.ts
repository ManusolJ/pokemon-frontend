export interface AuditLogRead {
  id: number;
  username: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}
