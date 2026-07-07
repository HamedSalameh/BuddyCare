import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BcAvatarComponent } from './bc-avatar.component';

describe('BcAvatarComponent', () => {
  let fixture: ComponentFixture<BcAvatarComponent>;
  let component: BcAvatarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BcAvatarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BcAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should show emoji for a known avatarId', () => {
    fixture.componentRef.setInput('avatarId', 1);
    fixture.detectChanges();
    const emoji = fixture.debugElement.query(By.css('span'));
    expect(emoji?.nativeElement.textContent.trim()).toBe('🐱');
  });

  it('should compute initials from a full name', () => {
    fixture.componentRef.setInput('name', 'Sara Ali');
    fixture.detectChanges();
    expect(component.initials()).toBe('SA');
  });

  it('should compute single initial for single-word name', () => {
    fixture.componentRef.setInput('name', 'Lana');
    fixture.detectChanges();
    expect(component.initials()).toBe('L');
  });

  it('should apply correct size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.bc-avatar'));
    expect(el.nativeElement.classList).toContain('w-14');
  });
});
