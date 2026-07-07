import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { BcButtonComponent } from '@shared/components';
import { signal } from '@angular/core';

@Component({
  selector: 'bc-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, BcButtonComponent],
  template: `
    <div class="flex flex-col min-h-full px-6 py-10 gap-6"
         style="background:linear-gradient(160deg,#EDE7FF 0%,#F8F7FF 50%,#E0F7FA 100%)">
      <h1 class="text-2xl font-extrabold text-ink">{{ 'AUTH.FORGOT_PASSWORD' | translate }}</h1>

      @if (sent()) {
        <div class="bg-brand-green-light rounded-card p-4 text-center">
          <p class="font-bold text-brand-green">Check your email — a reset link is on the way!</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <input type="email" formControlName="email" class="bc-input" placeholder="Email address" />
          <bc-button type="submit" variant="primary" size="lg" [fullWidth]="true" [loading]="loading()">
            Send reset link
          </bc-button>
        </form>
      }

      <a routerLink="/auth/sign-in" class="text-center text-sm font-bold text-brand-purple hover:underline mt-auto">
        ← Back to sign in
      </a>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly fb   = inject(FormBuilder);
  readonly loading = signal(false);
  readonly sent    = signal(false);
  readonly form    = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    try {
      await this.auth.sendPasswordReset(this.form.value.email!);
      this.sent.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
