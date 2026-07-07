import { Timestamp } from 'firebase/firestore';

// ─── Symptom entry (extensible — no schema change needed for new types) ────────
export interface SymptomEntry {
  categoryId: string;   // e.g. 'abdominal', 'headache', 'respiratory'
  typeId:     string;   // e.g. 'sharp', 'crampy', 'burning'
  severity?:  number;   // 0–10 normalised
}

// ─── Pain level (emoji-based, maps to numeric for analytics) ──────────────────
export type PainLevel = 0 | 1 | 2 | 3 | 4;
export const PAIN_EMOJI: Record<PainLevel, string> = {
  0: '😊', 1: '🙂', 2: '😐', 3: '😢', 4: '😭',
};

// ─── Check-in ─────────────────────────────────────────────────────────────────
export interface CheckIn {
  id:            string;
  familyId:      string;
  childId:       string;
  timestamp:     Timestamp | any;

  // Step data
  bodyLocations: string[];          // e.g. ['upper_belly', 'lower_belly']
  painLevel:     PainLevel;
  symptoms:      SymptomEntry[];
  onset:         string;            // 'just_now' | 'today' | 'yesterday' | 'few_days'
  activities:    string[];          // e.g. ['eating', 'school']
  mood:          string;            // 'happy' | 'sad' | 'angry' | 'scared' | 'tired' | 'excited'

  // Optional
  voiceNoteId?:  string;
  notes?:        string;

  // Flags
  emergencyFlag: boolean;
  syncState:     'synced' | 'pending' | 'failed';

  createdAt:     Timestamp | any;
  updatedAt:     Timestamp | any;
}

// ─── Emergency detection ──────────────────────────────────────────────────────
export function isEmergency(checkIn: Partial<CheckIn>): boolean {
  // Severe pain (4) + any of: sudden onset, multiple locations, or
  // specific symptom types (burning + pressure combination)
  if (checkIn.painLevel !== 4) return false;
  const isAcuteOnset = checkIn.onset === 'just_now';
  const manyLocations = (checkIn.bodyLocations?.length ?? 0) >= 3;
  const hasBurning = checkIn.symptoms?.some(s => s.typeId === 'burning') ?? false;
  return isAcuteOnset || manyLocations || hasBurning;
}
