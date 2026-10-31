import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const confirm = group.get(confirmKey)?.value;
    const password = group.get(passwordKey)?.value;
    return password === confirm ? null : { passwordMismatch: true };
  };
}

export function maxUtf8Bytes(limit: number): ValidatorFn {
  const encoder = new TextEncoder();
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || value.length === 0) {
      return null;
    }
    const bytes = encoder.encode(value).length;
    return bytes > limit ? { maxBytes: { limit, actual: bytes } } : null;
  };
}
