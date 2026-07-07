import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'bc-lang-switcher',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bc-lang-switcher" role="group" aria-label="Language selector">
      <button
        type="button"
        class="lang-btn"
        [class.lang-btn--active]="currentLang() === 'en'"
        [attr.aria-pressed]="currentLang() === 'en'"
        (click)="setLang('en')"
        aria-label="Switch to English"
      >EN</button>
      <span class="lang-divider" aria-hidden="true"></span>
      <button
        type="button"
        class="lang-btn"
        [class.lang-btn--active]="currentLang() === 'ar'"
        [attr.aria-pressed]="currentLang() === 'ar'"
        (click)="setLang('ar')"
        aria-label="التبديل إلى العربية"
      >عربية</button>
    </div>
  `,
  styleUrls: ['./bc-lang-switcher.component.scss'],
})
export class BcLangSwitcherComponent {
  private readonly translate = inject(TranslateService);
  private readonly document  = inject(DOCUMENT);

  readonly currentLang = signal(this.translate.getCurrentLang() ?? 'en');

  setLang(lang: 'en' | 'ar'): void {
    this.translate.use(lang).subscribe();
    this.currentLang.set(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir  = dir;
    this.document.body.dir = dir;
  }
}
