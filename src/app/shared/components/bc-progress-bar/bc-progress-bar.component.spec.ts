import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BcProgressBarComponent } from './bc-progress-bar.component';
import { provideTranslateService, TranslateNoOpLoader, provideTranslateLoader } from '@ngx-translate/core';

describe('BcProgressBarComponent', () => {
  let fixture: ComponentFixture<BcProgressBarComponent>;
  let component: BcProgressBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcProgressBarComponent],
      providers: [
        ...provideTranslateService({ lang: 'en' }),
        provideTranslateLoader(TranslateNoOpLoader),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BcProgressBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('current', 1);
    fixture.componentRef.setInput('total', 7);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have role="progressbar"', () => {
    const el = fixture.debugElement.query(By.css('[role="progressbar"]'));
    expect(el).toBeTruthy();
  });

  it('should set aria-valuenow to current', () => {
    const el = fixture.debugElement.query(By.css('[role="progressbar"]'));
    expect(el.nativeElement.getAttribute('aria-valuenow')).toBe('1');
  });

  it('should calculate 0% progress at step 1 of 7', () => {
    expect(component.progressPercent()).toBe(0);
  });

  it('should calculate 50% progress at step 4 of 7', () => {
    fixture.componentRef.setInput('current', 4);
    fixture.detectChanges();
    expect(component.progressPercent()).toBe(50);
  });

  it('should calculate 100% progress at last step', () => {
    fixture.componentRef.setInput('current', 7);
    fixture.detectChanges();
    expect(component.progressPercent()).toBe(100);
  });

  it('should render 7 step dots', () => {
    const dots = fixture.debugElement.queryAll(By.css('.bc-step-dot'));
    expect(dots.length).toBe(7);
  });

  it('should mark the active dot', () => {
    fixture.componentRef.setInput('current', 3);
    fixture.detectChanges();
    const active = fixture.debugElement.queryAll(By.css('.bc-step-dot--active'));
    expect(active.length).toBe(1);
  });
});
