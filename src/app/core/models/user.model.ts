// ─── Timestamp helper ──────────────────────────────────────────────────────────
export type Timestamp = { seconds: number; nanoseconds: number };

// ─── Family ────────────────────────────────────────────────────────────────────
export interface Family {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  locale: 'en' | 'ar';
  timezone: string;
}

// ─── Parent (one per UID, lives under families/{familyId}/parents/{uid}) ───────
export interface Parent {
  uid: string;
  familyId: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'admin' | 'member';
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// ─── Child ─────────────────────────────────────────────────────────────────────
export interface Child {
  id: string;
  familyId: string;
  name: string;
  dateOfBirth?: string; // ISO date string YYYY-MM-DD
  avatarId: number;     // 1–10, maps to AVATAR_OPTIONS
  color: string;        // pastel hex for the child's accent colour
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// ─── Auth state ────────────────────────────────────────────────────────────────
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  parent: Parent | null;
  family: Family | null;
  /** Active child the parent is viewing / child is using */
  activeChild: Child | null;
  /** All children in the family */
  children: Child[];
}

// ─── Onboarding ────────────────────────────────────────────────────────────────
export interface OnboardingState {
  step: 'family' | 'child' | 'done';
  familyName: string;
  children: Partial<Child>[];
}
