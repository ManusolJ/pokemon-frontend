import { ContactRequest } from '@shared/interfaces/misc/contact-request.interface';

import { ContactService } from '@core/services/contact.service';

import { finalize } from 'rxjs';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 60;
const MESSAGE_MIN_LENGTH = 10;
const SUBJECT_MAX_LENGTH = 120;
const MESSAGE_MAX_LENGTH = 2000;

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-contact',
  styleUrls: ['./contact.css', '../auth/styles/auth-form.css'],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly formBuilder = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  protected readonly isSent = signal(false);
  protected readonly hasError = signal(false);
  protected readonly isLoading = signal(false);

  protected readonly nameMinLength = NAME_MIN_LENGTH;
  protected readonly nameMaxLength = NAME_MAX_LENGTH;
  protected readonly messageMinLength = MESSAGE_MIN_LENGTH;
  protected readonly messageMaxLength = MESSAGE_MAX_LENGTH;

  protected readonly form = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(NAME_MIN_LENGTH),
        Validators.maxLength(NAME_MAX_LENGTH),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.maxLength(SUBJECT_MAX_LENGTH)]],
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(MESSAGE_MIN_LENGTH),
        Validators.maxLength(MESSAGE_MAX_LENGTH),
      ],
    ],
  });

  protected get nameControl() {
    return this.form.controls.name;
  }

  protected get emailControl() {
    return this.form.controls.email;
  }

  protected get subjectControl() {
    return this.form.controls.subject;
  }

  protected get messageControl() {
    return this.form.controls.message;
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    const request: ContactRequest = this.form.getRawValue();

    this.contactService
      .sendMessage(request)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.isSent.set(true),
        error: () => this.hasError.set(true),
      });
  }

  protected resetForm(): void {
    this.form.reset();
    this.isSent.set(false);
    this.hasError.set(false);
  }
}
