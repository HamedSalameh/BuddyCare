import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BcLangSwitcherComponent } from './bc-lang-switcher.component';
import { provideTranslateService, TranslateNoOpLoader, provideTranslateLoader } from '@ngx-translate/core';

describe('BcLangSwitcherComponent', () => {
  let fixture: ComponentFixture<BcLangSwitcherComponent>;
  let component: BcLangSwitcherComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcLangSwitcherComponent],
      providers: [
        ...provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
        provideTranslateLoader(TranslateNoOpLoader),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BcLangSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render two language buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.lang-btn'));
    expect(buttons.length).toBe(2);
  });

  it('should mark EN button as active initially', () => {
    const enBtn = fixture.debugElement.queryAll(By.css('.lang-btn'))[0];
    expect(enBtn.nativeElement.classList).toContain('lang-btn--active');
  });

  it('should switch to AR when AR button is clicked', () => {
    const arBtn = fixture.debugElement.queryAll(By.css('.lang-btn'))[1];
    arBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.currentLang()).toBe('ar');
  });

  it('should switch back to EN when EN button is clicked', () => {
    // switch to AR first
    component.setLang('ar');
    fixture.detectChanges();
    // then back to EN
    const enBtn = fixture.debugElement.queryAll(By.css('.lang-btn'))[0];
    enBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.currentLang()).toBe('en');
  });

  it('should set aria-pressed=true on active button', () => {
    const enBtn = fixture.debugElement.queryAll(By.css('.lang-btn'))[0];
    expect(enBtn.nativeElement.getAttribute('aria-pressed')).toBe('true');
  });
});
