import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BcButtonComponent } from './bc-button.component';
import { By } from '@angular/platform-browser';

describe('BcButtonComponent', () => {
  let fixture: ComponentFixture<BcButtonComponent>;
  let component: BcButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BcButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a <button> element', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('should apply primary variant class by default', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('bc-btn--primary');
  });

  it('should apply secondary variant class when set', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('bc-btn--secondary');
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(btn.disabled).toBe(true);
  });

  it('should show loading spinner when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('.bc-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should emit clicked event on click', () => {
    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(emitted).toBe(true);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let emitted = false;
    component.clicked.subscribe(() => (emitted = true));
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(emitted).toBe(false);
  });

  it('should apply full width class when fullWidth is true', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('w-full');
  });

  it('should show left icon when iconLeft is set', () => {
    fixture.componentRef.setInput('iconLeft', 'home');
    fixture.detectChanges();
    const icon = fixture.debugElement.query(By.css('.material-symbols-rounded'));
    expect(icon?.nativeElement.textContent.trim()).toBe('home');
  });
});
