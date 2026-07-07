import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { BcButtonComponent, BcLangSwitcherComponent } from '@shared/components';
import { mapAuthError } from '../../utils/auth-error.util';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'bc-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, BcButtonComponent, BcLangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="signup-page flex flex-col min-h-full px-6 py-10 gap-6">

      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-ink">{{ 'AUTH.SIGN_UP' | translate }}</h1>
          <p class="text-sm text-ink-secondary mt-1">BuddyCare</p>
        </div>
        <bc-lang-switcher />
      </div>

      @if (errorKey()) {
        <div class="bg-brand-red-light rounded-card px-4 py-3" role="alert" aria-live="assertive">
          <p class="text-sm font-semibold text-brand-red">{{ errorKey() | translate }}</p>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4" novalidate>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-ink-secondary" for="displayName">
            Your name
          </label>
          <input id="displayName" type="text" formControlName="displayName"
                 autocomplete="name" class="bc-input"
                 [class.bc-input--error]="showError('displayName')" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-ink-secondary" for="su-email">
            {{ 'AUTH.EMAIL' | translate }}
          </label>
          <input id="su-email" type="email" formControlName="email"
                 autocomplete="email" class="bc-input"
                 [class.bc-input--error]="showError('email')" />
          @if (showError('email')) {
            <p class="text-xs text-brand-red font-semibold" role="alert">
              {{ 'AUTH.ERRORS.INVALID_EMAIL' | translate }}
            </p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-ink-secondary" for="su-password">
            {{ 'AUTH.PASSWORD' | translate }}
          </label>
          <input id="su-password" type="password" formControlName="password"
                 autocomplete="new-password" class="bc-input"
                 [class.bc-input--error]="showError('password')" />
          @if (showError('password')) {
            <p class="text-xs text-brand-red font-semibold" role="alert">
              {{ 'AUTH.ERRORS.WEAK_PASSWORD' | translate }}
            </p>
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-ink-secondary" for="confirmPassword">
            {{ 'AUTH.CONFIRM_PASSWORD' | translate }}
          </label>
          <input id="confirmPassword" type="password" formControlName="confirmPassword"
                 autocomplete="new-password" class="bc-input"
                 [class.bc-input--error]="form.hasError('mismatch') && form.get('confirmPassword')?.touched" />
          @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
            <p class="text-xs text-brand-red font-semibold" role="alert">Passwords don't match.</p>
          }
        </div>

        <bc-button type="submit" variant="primary" size="lg" [fullWidth]="true" [loading]="loading()">
          {{ 'AUTH.SIGN_UP' | translate }}
        </bc-button>
      </form>

      <p class="text-center text-sm text-ink-secondary mt-auto">
        {{ 'AUTH.HAVE_ACCOUNT' | translate }}
        <a routerLink="/auth/sign-in" class="font-bold text-brand-purple hover:underline ms-1">
          {{ 'AUTH.SIGN_IN' | translate }}
        </a>
      </p>
    </div>
  `,
  styles: [`.signup-page { background: linear-gradient(160deg,#EDE7FF 0%,#F8F7FF 50%,#E0F7FA 100%); }`],
})
export class SignUpComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading  = signal(false);
  readonly errorKey = signal('');

  readonly form = this.fb.group({
    displayName:     ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  showError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorKey.set('');
    try {
      await this.auth.signUpWithEmail(
        this.form.value.email!,
        this.form.value.password!,
        this.form.value.displayName!,
      );
      this.router.navigate(['/auth/onboarding']);
    } catch (err: any) {
      this.errorKey.set(mapAuthError(err?.code));
    } finally {
      this.loading.set(false);
    }
  }
}



