import { Injectable, signal, computed } from '@angular/core';
import {
  BODY_LOCATIONS,
  PAIN_OPTIONS,
  FEEL_TYPES,
  ONSET_OPTIONS,
  ACTIVITY_OPTIONS,
  MOOD_OPTIONS,
  BodyLocation,
  PainOption,
  FeelType,
  OnsetOption,
  ActivityOption,
  MoodOption,
} from './symptom-config';
import { CheckIn, PainLevel, isEmergency } from '@core/models/check-in.model';

export type CheckInStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const TOTAL_STEPS: CheckInStep = 7;

export interface CheckInDraft {
  bodyLocations: string[];
  painLevel:     PainLevel | null;
  feelTypes:     string[];
  onset:         string | null;
  activities:    string[];
  mood:          string | null;
  voiceNoteId:   string | null;
}

const EMPTY_DRAFT: CheckInDraft = {
  bodyLocations: [],
  painLevel:     null,
  feelTypes:     [],
  onset:         null,
  activities:    [],
  mood:          null,
  voiceNoteId:   null,
};

@Injectable({ providedIn: 'root' })
export class CheckInFlowService {
  // ─── State signals ────────────────────────────────────────────────────────
  readonly step    = signal<CheckInStep>(1);
  readonly draft   = signal<CheckInDraft>({ ...EMPTY_DRAFT });
  readonly started = signal(false);
  readonly done    = signal(false);

  // ─── Config (seed data — will be Firestore-backed in production) ──────────
  readonly bodyLocations  = signal<BodyLocation[]>(BODY_LOCATIONS);
  readonly painOptions    = signal<PainOption[]>(PAIN_OPTIONS);
  readonly feelTypes      = signal<FeelType[]>(FEEL_TYPES);
  readonly onsetOptions   = signal<OnsetOption[]>(ONSET_OPTIONS);
  readonly activityOptions = signal<ActivityOption[]>(ACTIVITY_OPTIONS);
  readonly moodOptions    = signal<MoodOption[]>(MOOD_OPTIONS);

  // ─── Derived ─────────────────────────────────────────────────────────────
  readonly progress = computed(() =>
    Math.round(((this.step() - 1) / (TOTAL_STEPS - 1)) * 100),
  );

  readonly isEmergencyFlag = computed(() =>
    isEmergency({
      painLevel:     this.draft().painLevel ?? undefined,
      bodyLocations: this.draft().bodyLocations,
      symptoms:      this.draft().feelTypes.map(id => ({ categoryId: 'abdominal', typeId: id })),
      onset:         this.draft().onset ?? undefined,
    }),
  );

  readonly canProceed = computed(() => {
    const d = this.draft();
    switch (this.step()) {
      case 1: return d.bodyLocations.length > 0;
      case 2: return d.painLevel !== null;
      case 3: return d.feelTypes.length > 0;
      case 4: return d.onset !== null;
      case 5: return d.activities.length > 0;
      case 6: return d.mood !== null;
      case 7: return true; // voice note is optional
      default: return false;
    }
  });

  // ─── Navigation ──────────────────────────────────────────────────────────

  start(): void {
    this.step.set(1);
    this.draft.set({ ...EMPTY_DRAFT });
    this.done.set(false);
    this.started.set(true);
  }

  next(): void {
    const current = this.step();
    if (current < TOTAL_STEPS) {
      this.step.set((current + 1) as CheckInStep);
    } else {
      this.done.set(true);
    }
  }

  prev(): void {
    const current = this.step();
    if (current > 1) {
      this.step.set((current - 1) as CheckInStep);
    }
  }

  reset(): void {
    this.step.set(1);
    this.draft.set({ ...EMPTY_DRAFT });
    this.done.set(false);
    this.started.set(false);
  }

  // ─── Step-specific selectors ──────────────────────────────────────────────

  toggleBodyLocation(id: string): void {
    this.draft.update(d => {
      const locs = d.bodyLocations.includes(id)
        ? d.bodyLocations.filter(l => l !== id)
        : [...d.bodyLocations, id];
      return { ...d, bodyLocations: locs };
    });
  }

  setPainLevel(level: PainLevel): void {
    this.draft.update(d => ({ ...d, painLevel: level }));
    // Auto-advance on pain level selection
    setTimeout(() => this.next(), 350);
  }

  toggleFeelType(id: string): void {
    this.draft.update(d => {
      const types = d.feelTypes.includes(id)
        ? d.feelTypes.filter(t => t !== id)
        : [...d.feelTypes, id];
      return { ...d, feelTypes: types };
    });
  }

  setOnset(id: string): void {
    this.draft.update(d => ({ ...d, onset: id }));
    setTimeout(() => this.next(), 350);
  }

  toggleActivity(id: string): void {
    this.draft.update(d => {
      const acts = d.activities.includes(id)
        ? d.activities.filter(a => a !== id)
        : [...d.activities, id];
      return { ...d, activities: acts };
    });
  }

  setMood(id: string): void {
    this.draft.update(d => ({ ...d, mood: id }));
    setTimeout(() => this.next(), 350);
  }

  setVoiceNote(id: string | null): void {
    this.draft.update(d => ({ ...d, voiceNoteId: id }));
  }

  // ─── Build final CheckIn ─────────────────────────────────────────────────

  buildCheckIn(familyId: string, childId: string): Omit<CheckIn, 'id'> {
    const d = this.draft();
    return {
      familyId,
      childId,
      timestamp:     new Date() as any,
      bodyLocations: d.bodyLocations,
      painLevel:     d.painLevel ?? 0,
      symptoms:      d.feelTypes.map(id => ({ categoryId: 'abdominal', typeId: id })),
      onset:         d.onset ?? 'today',
      activities:    d.activities,
      mood:          d.mood ?? 'happy',
      ...(d.voiceNoteId != null ? { voiceNoteId: d.voiceNoteId } : {}),
      emergencyFlag: this.isEmergencyFlag(),
      syncState:     'pending',
      createdAt:     new Date() as any,
      updatedAt:     new Date() as any,
    };
  }
}
