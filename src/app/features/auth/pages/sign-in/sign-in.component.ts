import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { BcButtonComponent, BcLangSwitcherComponent } from '@shared/components';
import { mapAuthError } from '../../utils/auth-error.util';

@Component({
  selector: 'bc-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, BcButtonComponent, BcLangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading  = signal(false);
  readonly errorKey = signal('');
  readonly appleAvailable = /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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
      await this.auth.signInWithEmail(this.form.value.email!, this.form.value.password!);
      this.navigateAfterAuth();
    } catch (err: any) {
      this.errorKey.set(mapAuthError(err?.code));
    } finally {
      this.loading.set(false);
    }
  }

  async signInWithGoogle(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorKey.set('');
    try {
      await this.auth.signInWithGoogle();
      this.navigateAfterAuth();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        this.errorKey.set(mapAuthError(err?.code));
      }
    } finally {
      this.loading.set(false);
    }
  }

  async signInWithApple(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.errorKey.set('');
    try {
      await this.auth.signInWithApple();
      this.navigateAfterAuth();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        this.errorKey.set(mapAuthError(err?.code));
      }
    } finally {
      this.loading.set(false);
    }
  }

  private async navigateAfterAuth(): Promise<void> {
    // Wait for loadParentProfile to emit via profileDone$ before checking state.
    // profileDone$ is a Subject — firstValueFrom blocks until the next emission.
    await firstValueFrom(this.auth.profileDone$);
    if (!this.auth.hasFamily() || !this.auth.hasChildren()) {
      this.router.navigate(['/auth/onboarding']);
    } else {
      this.router.navigate(['/parent/dashboard']);
    }
  }
}



