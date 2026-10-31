import { ErrorResponse } from '@shared/interfaces/misc/error-response.interface';

import { HttpErrorResponse } from '@angular/common/http';

export function describeHttpError(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return "Can't reach the server. Check your connection and try again.";
  }

  if (error.status === 429) {
    return 'Too many attempts. Wait a minute and try again.';
  }

  if (error.status >= 500) {
    return 'Something went wrong on our side. Please try again later.';
  }

  const body = error.error as Partial<ErrorResponse> | null;
  const fieldErrors = body?.fieldErrors ? Object.values(body.fieldErrors) : [];

  return fieldErrors[0] ?? body?.message ?? fallback;
}
