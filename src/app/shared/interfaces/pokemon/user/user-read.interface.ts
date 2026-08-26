export interface UserRead {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  deletedAt: string | null;
}
