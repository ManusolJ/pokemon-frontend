export interface AuditLogFilter {
  id?: number;
  username?: string;
  usernameExact?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
}
