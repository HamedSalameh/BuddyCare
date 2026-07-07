import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { BcLangSwitcherComponent } from '@shared/components';

@Component({
  selector: 'bc-parent-settings',
  standalone: true,
  imports: [TranslatePipe, BcLangSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding:1.25rem">
      <h1 style="font-size:1rem;font-weight:800;color:#1A1A2E;margin:0 0 1.5rem">{{ 'SETTINGS.TITLE' | translate }}</h1>

      <!-- Language (active) -->
      <div style="background:#fff;border-radius:1rem;box-shadow:0 2px 8px rgba(124,77,255,0.06);overflow:hidden;margin-bottom:1rem">
        <div style="display:flex;align-items:center;gap:0.75rem;padding:1rem">
          <span style="font-size:1.25rem">🌐</span>
          <span style="font-size:0.875rem;font-weight:600;color:#1A1A2E;flex:1">{{ 'SETTINGS.LANGUAGE' | translate }}</span>
          <bc-lang-switcher />
        </div>
      </div>

      <!-- Account -->
      <div style="background:#fff;border-radius:1rem;box-shadow:0 2px 8px rgba(124,77,255,0.06);overflow:hidden">
        <div style="padding:0.75rem 1rem;font-size:0.7rem;font-weight:800;color:#9CA3AF;letter-spacing:0.05em;text-transform:uppercase;border-bottom:1px solid rgba(124,77,255,0.06)">
          Account
        </div>
        <button
          (click)="signOut()"
          style="width:100%;display:flex;align-items:center;gap:0.75rem;padding:1rem;background:none;border:none;cursor:pointer;text-align:start"
        >
          <span style="font-size:1.25rem">🚪</span>
          <span style="font-size:0.875rem;font-weight:700;color:#EF5350;flex:1">{{ 'SETTINGS.SIGN_OUT' | translate }}</span>
        </button>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/auth/sign-in']);
  }
}


