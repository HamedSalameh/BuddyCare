import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BcMascotComponent } from './bc-mascot.component';

describe('BcMascotComponent', () => {
  let fixture: ComponentFixture<BcMascotComponent>;
  let component: BcMascotComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcMascotComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BcMascotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should render the SVG figure', () => {
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg).toBeTruthy();
  });

  it('should NOT render speech bubble when message is empty', () => {
    const bubble = fixture.debugElement.query(By.css('.bc-mascot__bubble'));
    expect(bubble).toBeNull();
  });

  it('should render speech bubble when message is provided', () => {
    fixture.componentRef.setInput('message', 'Hello there!');
    fixture.detectChanges();
    const bubble = fixture.debugElement.query(By.css('.bc-mascot__bubble'));
    expect(bubble).toBeTruthy();
    expect(bubble.nativeElement.textContent).toContain('Hello there!');
  });

  it('should have role="img" with aria-label', () => {
    const host = fixture.debugElement.query(By.css('[role="img"]'));
    expect(host).toBeTruthy();
    expect(host.nativeElement.getAttribute('aria-label')).toContain('mascot');
  });

  it('should apply float animation class when animated is true', () => {
    const figure = fixture.debugElement.query(By.css('.bc-mascot__figure'));
    expect(figure.nativeElement.classList).toContain('animate-float');
  });

  it('should not apply float animation class when animated is false', () => {
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();
    const figure = fixture.debugElement.query(By.css('.bc-mascot__figure'));
    expect(figure.nativeElement.classList).not.toContain('animate-float');
  });
});
