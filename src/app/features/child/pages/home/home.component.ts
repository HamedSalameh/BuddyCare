import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BcMascotComponent, BcButtonComponent, BcLangSwitcherComponent } from '@shared/components';

@Component({
  selector: 'bc-home',
  standalone: true,
  imports: [TranslatePipe, BcMascotComponent, BcButtonComponent, BcLangSwitcherComponent],
  template: `
    <div class="home-page">

      <!-- Top bar: logo on left, lang switcher on right -->
      <div class="home-topbar">
        <div class="home-brand">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <circle cx="18" cy="18" r="18" fill="#7C4DFF"/>
            <circle cx="12" cy="12" r="5" fill="#2D2D2D"/>
            <circle cx="24" cy="12" r="5" fill="#2D2D2D"/>
            <circle cx="18" cy="20" r="9" fill="#F5F5F5"/>
            <circle cx="14" cy="19" r="3.5" fill="#2D2D2D"/>
            <circle cx="22" cy="19" r="3.5" fill="#2D2D2D"/>
            <circle cx="18" cy="26" r="2" fill="#FF6B9D"/>
            <path d="M12 28 C12 24 18 26 18 26 C18 26 24 24 24 28" fill="#7C4DFF"/>
          </svg>
          <div class="home-brand__text">
            <span class="home-brand__name">{{ 'APP.NAME' | translate }}</span>
            <span class="home-brand__tagline">{{ 'APP.TAGLINE' | translate }}</span>
          </div>
        </div>
        <bc-lang-switcher />
      </div>

      <!-- Centre: Mascot -->
      <div class="home-mascot-area">
        <bc-mascot
          mood="happy"
          size="xl"
          [message]="'HOME.MASCOT_QUESTION' | translate"
          [animated]="true"
        />
      </div>

      <!-- Bottom: CTA -->
      <div class="home-cta">
        <bc-button
          variant="primary"
          size="lg"
          [fullWidth]="true"
          (clicked)="startCheckIn()"
        >
          <span style="display:inline-flex;align-items:center;gap:0.5rem">
            <span aria-hidden="true">⭐</span>
            {{ 'HOME.START_CHECKIN' | translate }}
          </span>
        </bc-button>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly router = inject(Router);

  startCheckIn(): void {
    this.router.navigate(['/child/check-in']);
  }
}
