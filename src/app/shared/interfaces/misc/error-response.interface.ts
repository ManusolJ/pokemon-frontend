export interface ErrorResponse {
  path: string;
  error: string;
  status: number;
  message: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
}
