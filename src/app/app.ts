import { Component, OnInit, inject, signal, Injectable } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

// ── PWA update service ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly sw = inject(SwUpdate, { optional: true });
  readonly updateAvailable = signal(false);

  constructor() {
    if (!this.sw?.isEnabled) return;
    this.sw.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.updateAvailable.set(true));
    // Poll every 30 minutes for a new version
    interval(30 * 60 * 1000).subscribe(() => this.sw?.checkForUpdate().catch(() => {}));
  }

  reload(): void {
    this.sw?.activateUpdate()
      .then(() => window.location.reload())
      .catch(() => window.location.reload());
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (update.updateAvailable()) {
      <div class="bc-update-bar" role="status" aria-live="polite">
        <span>🆕 A new version is ready</span>
        <button class="bc-update-btn" (click)="update.reload()">Update now</button>
      </div>
    }
  `,
  styles: [`
    .bc-update-bar {
      position: fixed; bottom: 80px; inset-inline: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      background: #1A1A2E; color: #fff; padding: 0.75rem 1.25rem;
      font-size: 0.8rem; font-weight: 700; font-family: 'Nunito', sans-serif;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.25);
      animation: bc-slide-up 0.3s ease-out;
    }
    @keyframes bc-slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .bc-update-btn {
      background: #7C4DFF; color: #fff; border: none; border-radius: 2rem;
      padding: 0.35rem 0.875rem; font-size: 0.75rem; font-weight: 800;
      cursor: pointer; font-family: inherit;
      &:hover { background: #6B3DE8; }
    }
  `],
})
export class App implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly document  = inject(DOCUMENT);
  readonly update = inject(AppUpdateService);

  ngOnInit(): void {
    const browserLang = this.translate.getBrowserLang() ?? 'en';
    const lang = /^(en|ar)$/.test(browserLang) ? browserLang : 'en';
    this.translate.use(lang).subscribe();
    this.applyDirection(lang);
    this.translate.onLangChange.subscribe(({ lang: newLang }) => {
      this.applyDirection(newLang);
    });
  }

  private applyDirection(lang: string): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = dir;
    this.document.body.dir = dir;
  }
}



