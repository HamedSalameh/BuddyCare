// ─── Symptom config types ─────────────────────────────────────────────────────
// These are DATA, not code — new symptom types never require a schema change.

export interface BodyLocation {
  id:       string;
  labelKey: string;   // i18n key
  emoji:    string;
  x: number; y: number; // relative % on body diagram (0–100)
}

export interface PainOption {
  level:    0 | 1 | 2 | 3 | 4;
  emoji:    string;
  labelKey: string;
  color:    string;   // pastel hex for the chip
}

export interface FeelType {
  id:       string;
  labelKey: string;
  emoji:    string;
  categoryId: string; // e.g. 'abdominal'
}

export interface OnsetOption {
  id:       string;
  labelKey: string;
  emoji:    string;
}

export interface ActivityOption {
  id:       string;
  labelKey: string;
  emoji:    string;
}

export interface MoodOption {
  id:       string;
  labelKey: string;
  emoji:    string;
  color:    string;
}

// ─── Seed data (abdominal pain — matches reference image) ────────────────────

export const BODY_LOCATIONS: BodyLocation[] = [
  { id: 'upper_belly',       labelKey: 'CHECK_IN.BODY.UPPER_BELLY',        emoji: '🔼', x: 50, y: 30 },
  { id: 'lower_belly',       labelKey: 'CHECK_IN.BODY.LOWER_BELLY',        emoji: '🔽', x: 50, y: 55 },
  { id: 'left_side',         labelKey: 'CHECK_IN.BODY.LEFT_SIDE',          emoji: '◀', x: 25, y: 42 },
  { id: 'right_side',        labelKey: 'CHECK_IN.BODY.RIGHT_SIDE',         emoji: '▶', x: 75, y: 42 },
  { id: 'around_belly_button', labelKey: 'CHECK_IN.BODY.AROUND_BELLY_BUTTON', emoji: '🎯', x: 50, y: 44 },
];

export const PAIN_OPTIONS: PainOption[] = [
  { level: 0, emoji: '😊', labelKey: 'CHECK_IN.PAIN.NO_PAIN',       color: '#E8F5E9' },
  { level: 1, emoji: '🙂', labelKey: 'CHECK_IN.PAIN.TINY_ACHE',     color: '#FFFDE7' },
  { level: 2, emoji: '😐', labelKey: 'CHECK_IN.PAIN.HURTS_LITTLE',  color: '#FFF3E0' },
  { level: 3, emoji: '😢', labelKey: 'CHECK_IN.PAIN.HURTS_LOT',     color: '#FFE4EF' },
  { level: 4, emoji: '😭', labelKey: 'CHECK_IN.PAIN.REALLY_BAD',    color: '#FFEBEE' },
];

export const FEEL_TYPES: FeelType[] = [
  { id: 'sharp',    labelKey: 'CHECK_IN.FEEL.SHARP',    emoji: '🗡️',  categoryId: 'abdominal' },
  { id: 'crampy',   labelKey: 'CHECK_IN.FEEL.CRAMPY',   emoji: '🌀',  categoryId: 'abdominal' },
  { id: 'burning',  labelKey: 'CHECK_IN.FEEL.BURNING',  emoji: '🔥',  categoryId: 'abdominal' },
  { id: 'pressure', labelKey: 'CHECK_IN.FEEL.PRESSURE', emoji: '⬇️',  categoryId: 'abdominal' },
  { id: 'bloated',  labelKey: 'CHECK_IN.FEEL.BLOATED',  emoji: '🎈',  categoryId: 'abdominal' },
  { id: 'nausea',   labelKey: 'CHECK_IN.FEEL.NAUSEA',   emoji: '🤢',  categoryId: 'abdominal' },
];

export const DONT_KNOW_OPTION = { id: 'dont_know', labelKey: 'CHECK_IN.DONT_KNOW', emoji: '❓' };

export const ONSET_OPTIONS: OnsetOption[] = [
  { id: 'just_now',  labelKey: 'CHECK_IN.ONSET.JUST_NOW',  emoji: '⚡' },
  { id: 'today',     labelKey: 'CHECK_IN.ONSET.TODAY',     emoji: '☀️' },
  { id: 'yesterday', labelKey: 'CHECK_IN.ONSET.YESTERDAY', emoji: '🌙' },
  { id: 'few_days',  labelKey: 'CHECK_IN.ONSET.FEW_DAYS',  emoji: '📆' },
];

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: 'eating',    labelKey: 'CHECK_IN.ACTIVITY.EATING',    emoji: '🍽️' },
  { id: 'playing',   labelKey: 'CHECK_IN.ACTIVITY.PLAYING',   emoji: '⚽' },
  { id: 'school',    labelKey: 'CHECK_IN.ACTIVITY.SCHOOL',    emoji: '🏫' },
  { id: 'sleeping',  labelKey: 'CHECK_IN.ACTIVITY.SLEEPING',  emoji: '😴' },
  { id: 'bathroom',  labelKey: 'CHECK_IN.ACTIVITY.BATHROOM',  emoji: '🚽' },
  { id: 'traveling', labelKey: 'CHECK_IN.ACTIVITY.TRAVELING', emoji: '🚗' },
  { id: 'nothing',   labelKey: 'CHECK_IN.ACTIVITY.NOTHING',   emoji: '💭' },
];

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy',   labelKey: 'CHECK_IN.MOOD.HAPPY',   emoji: '😊', color: '#E8F5E9' },
  { id: 'sad',     labelKey: 'CHECK_IN.MOOD.SAD',     emoji: '😢', color: '#E0F7FA' },
  { id: 'angry',   labelKey: 'CHECK_IN.MOOD.ANGRY',   emoji: '😠', color: '#FFEBEE' },
  { id: 'scared',  labelKey: 'CHECK_IN.MOOD.SCARED',  emoji: '😨', color: '#FFF3E0' },
  { id: 'tired',   labelKey: 'CHECK_IN.MOOD.TIRED',   emoji: '😴', color: '#EDE7FF' },
  { id: 'excited', labelKey: 'CHECK_IN.MOOD.EXCITED', emoji: '🤩', color: '#FFFDE7' },
];
