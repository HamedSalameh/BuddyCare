import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    // Detect browser language, fall back to 'en'
    const browserLang = this.translate.getBrowserLang() ?? 'en';
    const lang = /^(en|ar)$/.test(browserLang) ? browserLang : 'en';
    this.translate.use(lang).subscribe();

    // Apply RTL/LTR direction for detected language
    this.applyDirection(lang);

    // Re-apply when language changes
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


