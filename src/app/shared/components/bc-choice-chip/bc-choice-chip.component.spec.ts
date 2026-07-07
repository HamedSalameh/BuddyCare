import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BcChoiceChipComponent } from './bc-choice-chip.component';

describe('BcChoiceChipComponent', () => {
  let fixture: ComponentFixture<BcChoiceChipComponent>;
  let component: BcChoiceChipComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcChoiceChipComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BcChoiceChipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'test-value');
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render a button with role="radio"', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('role')).toBe('radio');
  });

  it('should set aria-checked when selected', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('aria-checked')).toBe('true');
  });

  it('should emit chipSelected with value on click', () => {
    let emittedValue = '';
    component.chipSelected.subscribe((v: string) => (emittedValue = v));
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(emittedValue).toBe('test-value');
  });

  it('should show emoji when emoji input is set', () => {
    fixture.componentRef.setInput('emoji', '😊');
    fixture.detectChanges();
    const emoji = fixture.debugElement.query(By.css('.bc-chip__emoji'));
    expect(emoji?.nativeElement.textContent.trim()).toBe('😊');
  });

  it('should show checkmark when selected', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    const check = fixture.debugElement.query(By.css('.bc-chip__check'));
    expect(check).toBeTruthy();
  });

  it('should not emit when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let emitted = false;
    component.chipSelected.subscribe(() => (emitted = true));
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(emitted).toBe(false);
  });
});
