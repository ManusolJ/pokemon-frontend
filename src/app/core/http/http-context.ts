import { HttpContext, HttpContextToken } from '@angular/common/http';

export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

export function silentErrors(): HttpContext {
  return new HttpContext().set(SILENT_ERRORS, true);
}
