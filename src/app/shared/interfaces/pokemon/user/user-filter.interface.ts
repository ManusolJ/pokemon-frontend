export interface UserFilter {
  id?: number;
  username?: string;
  usernameExact?: string;
  email?: string;
  role?: string;
  enabled?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}
