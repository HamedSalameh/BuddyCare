import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { provideTranslateService } from '@ngx-translate/core';
import { TranslateNoOpLoader, provideTranslateLoader } from '@ngx-translate/core';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        ...provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
        provideTranslateLoader(TranslateNoOpLoader),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should bootstrap without errors', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    // Root component renders a router-outlet; no inner HTML to assert beyond existence
    expect(fixture.nativeElement).toBeTruthy();
  });
});
