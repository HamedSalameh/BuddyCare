import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { FIREBASE_FIRESTORE } from '@core/firebase/firebase.providers';
import { AuthService } from '@core/auth/auth.service';
import { LoggerService } from '@core/logging/logger.service';
import {
  RewardState,
  Sticker,
  STICKERS,
  POINTS_PER_CHECKIN,
  POINTS_PER_STREAK_DAY,
  PET_HAPPINESS_PER_CHECKIN,
  gardenLevelForCount,
  aquariumLevelForCount,
  newlyUnlockedStickers,
} from '@core/models/reward.model';

@Injectable({ providedIn: 'root' })
export class RewardService {
  private readonly db     = inject(FIREBASE_FIRESTORE) as Firestore;
  private readonly auth   = inject(AuthService);
  private readonly logger = inject(LoggerService);

  private readonly _state = signal<RewardState | null>(null);
  private readonly _newStickers = signal<Sticker[]>([]);

  readonly state       = this._state.asReadonly();
  readonly newStickers = this._newStickers.asReadonly();

  readonly gardenStage  = computed(() => this._state()?.gardenLevel  ?? 0);
  readonly aquariumStage = computed(() => this._state()?.aquariumLevel ?? 0);
  readonly petHappiness  = computed(() => this._state()?.petHappiness  ?? 0);
  readonly totalPoints   = computed(() => this._state()?.totalPoints   ?? 0);
  readonly totalCheckIns = computed(() => this._state()?.totalCheckIns ?? 0);
  readonly streak        = computed(() => this._state()?.checkInStreak ?? 0);

  // ─── Load reward state ───────────────────────────────────────────────────────

  async loadForChild(familyId: string, childId: string): Promise<void> {
    try {
      const snap = await getDoc(this.rewardDocRef(familyId, childId));
      if (snap.exists()) {
        this._state.set(snap.data() as RewardState);
      } else {
        // Bootstrap default state for new child
        const defaultState = this.createDefaultState(familyId, childId);
        await setDoc(this.rewardDocRef(familyId, childId), defaultState);
        this._state.set(defaultState);
      }
    } catch (err) {
      this.logger.warn('[RewardService] loadForChild failed', err);
    }
  }

  // ─── Grant rewards after a check-in ──────────────────────────────────────────
  // NEVER-PUNISH rules:
  //   - Streaks never reset (only increment)
  //   - Pet happiness never goes negative
  //   - No negative feedback, no lost progress

  async grantCheckInReward(familyId: string, childId: string): Promise<Sticker[]> {
    let current = this._state();

    if (!current) {
      await this.loadForChild(familyId, childId);
      current = this._state();
    }

    if (!current) return [];

    const prevCount     = current.totalCheckIns;
    const today         = new Date().toISOString().slice(0, 10);
    const lastDate      = current.lastCheckInDate;
    const isNewDay      = lastDate !== today;

    // Calculate streak increment (never reset — just don't increment if same day)
    const newStreak = isNewDay ? current.checkInStreak + 1 : current.checkInStreak;

    // Points: base + streak bonus
    const streakBonus = isNewDay ? POINTS_PER_STREAK_DAY * Math.min(newStreak, 7) : 0;
    const pointsEarned = POINTS_PER_CHECKIN + streakBonus;

    // Pet happiness: clamp 0–100
    const newHappiness = Math.min(100, current.petHappiness + PET_HAPPINESS_PER_CHECKIN);

    const newCount        = prevCount + 1;
    const newGardenLevel  = gardenLevelForCount(newCount);
    const newAquariumLevel = aquariumLevelForCount(newCount);

    // Find newly unlocked stickers
    const earned = newlyUnlockedStickers(prevCount, newCount);
    const allStickers = [
      ...current.unlockedStickers,
      ...earned.map(s => s.id).filter(id => !current!.unlockedStickers.includes(id)),
    ];

    const updated: RewardState = {
      ...current,
      totalPoints:      current.totalPoints + pointsEarned,
      checkInStreak:    newStreak,
      longestStreak:    Math.max(current.longestStreak, newStreak),
      totalCheckIns:    newCount,
      petHappiness:     newHappiness,
      gardenLevel:      newGardenLevel,
      aquariumLevel:    newAquariumLevel,
      unlockedStickers: allStickers,
      lastCheckInDate:  today,
      updatedAt:        serverTimestamp() as any,
    };

    // Optimistic update
    this._state.set(updated);
    this._newStickers.set(earned);

    // Persist (best-effort, offline queued)
    try {
      await setDoc(this.rewardDocRef(familyId, childId), updated, { merge: true });
    } catch (err) {
      this.logger.warn('[RewardService] persist failed, will sync later', err);
    }

    this.logger.info(`[RewardService] +${pointsEarned}pts, garden:${newGardenLevel}, aquarium:${newAquariumLevel}`);
    return earned;
  }

  clearNewStickers(): void {
    this._newStickers.set([]);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private rewardDocRef(familyId: string, childId: string) {
    return doc(this.db, `families/${familyId}/children/${childId}/rewardState/current`);
  }

  private createDefaultState(familyId: string, childId: string): RewardState {
    return {
      familyId,
      childId,
      totalPoints:       0,
      checkInStreak:     0,
      longestStreak:     0,
      totalCheckIns:     0,
      petHappiness:      50,   // start halfway happy
      gardenLevel:       0,
      aquariumLevel:     0,
      unlockedStickers:  [],
      lastCheckInDate:   null,
      updatedAt:         serverTimestamp() as any,
    };
  }
}
