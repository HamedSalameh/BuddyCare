import { TestBed } from '@angular/core/testing';
import { CheckInFlowService, TOTAL_STEPS } from './check-in-flow.service';
import { PainLevel } from '@core/models/check-in.model';

describe('CheckInFlowService', () => {
  let service: CheckInFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckInFlowService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should start at step 1', () => {
    expect(service.step()).toBe(1);
  });

  it('should have empty draft initially', () => {
    expect(service.draft().bodyLocations).toEqual([]);
    expect(service.draft().painLevel).toBeNull();
  });

  it('start() should reset to step 1', () => {
    service.step.set(4);
    service.start();
    expect(service.step()).toBe(1);
    expect(service.started()).toBe(true);
  });

  it('next() advances the step', () => {
    service.step.set(1);
    service.next();
    expect(service.step()).toBe(2);
  });

  it('next() on last step sets done', () => {
    service.step.set(TOTAL_STEPS);
    service.next();
    expect(service.done()).toBe(true);
  });

  it('prev() decrements step', () => {
    service.step.set(3);
    service.prev();
    expect(service.step()).toBe(2);
  });

  it('prev() does not go below 1', () => {
    service.step.set(1);
    service.prev();
    expect(service.step()).toBe(1);
  });

  it('toggleBodyLocation adds and removes', () => {
    service.toggleBodyLocation('upper_belly');
    expect(service.draft().bodyLocations).toContain('upper_belly');
    service.toggleBodyLocation('upper_belly');
    expect(service.draft().bodyLocations).not.toContain('upper_belly');
  });

  it('canProceed is false on step 1 with no location', () => {
    service.step.set(1);
    expect(service.canProceed()).toBe(false);
  });

  it('canProceed is true on step 1 with a location', () => {
    service.step.set(1);
    service.toggleBodyLocation('upper_belly');
    expect(service.canProceed()).toBe(true);
  });

  it('canProceed is always true on step 7 (voice optional)', () => {
    service.step.set(7);
    expect(service.canProceed()).toBe(true);
  });

  it('isEmergencyFlag fires when pain=4 + onset=just_now', () => {
    service.draft.update(d => ({
      ...d,
      painLevel:     4 as PainLevel,
      bodyLocations: ['upper_belly'],
      onset:         'just_now',
    }));
    expect(service.isEmergencyFlag()).toBe(true);
  });

  it('isEmergencyFlag is false when pain < 4', () => {
    service.draft.update(d => ({
      ...d,
      painLevel:     3 as PainLevel,
      bodyLocations: ['upper_belly'],
      onset:         'just_now',
    }));
    expect(service.isEmergencyFlag()).toBe(false);
  });

  it('reset() clears all state', () => {
    service.toggleBodyLocation('upper_belly');
    service.step.set(5);
    service.reset();
    expect(service.step()).toBe(1);
    expect(service.draft().bodyLocations).toEqual([]);
    expect(service.started()).toBe(false);
  });
});
