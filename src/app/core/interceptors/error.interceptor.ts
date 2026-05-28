import { ErrorResponse } from '@shared/interfaces/misc/error-response.interface';

import { MessageService } from 'primeng/api';

import { inject } from '@angular/core';

import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';

import { catchError, throwError } from 'rxjs';

const TOAST_LIFE_LONG_MS = 5000;
const TOAST_LIFE_SHORT_MS = 4000;
const WARN_STATUSES = new Set<number>([404, 409, 429]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === HttpStatusCode.Unauthorized && !req.url.includes('/auth/')) {
        return throwError(() => error);
      }

      const body = error.error as ErrorResponse | null;

      if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Connection Error',
          detail: 'Unable to reach the server. Check your internet connection.',
          life: TOAST_LIFE_LONG_MS,
        });
        return throwError(() => error);
      }

      if (error.status >= HttpStatusCode.InternalServerError) {
        messageService.add({
          severity: 'error',
          summary: body?.error ?? 'Server Error',
          detail: 'Something went wrong on our end. Please try again later.',
          life: TOAST_LIFE_LONG_MS,
        });
        return throwError(() => error);
      }

      if (body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
        const count = Object.keys(body.fieldErrors).length;
        messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: `Form has ${count} ${count === 1 ? 'error' : 'errors'}.`,
          life: TOAST_LIFE_SHORT_MS,
        });
        return throwError(() => error);
      }

      messageService.add({
        severity: WARN_STATUSES.has(error.status) ? 'warn' : 'error',
        summary: body?.error ?? 'Error',
        detail: body?.message ?? 'Something went wrong',
        life: TOAST_LIFE_SHORT_MS,
      });

      return throwError(() => error);
    }),
  );
};
