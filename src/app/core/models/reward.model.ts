import { Timestamp } from 'firebase/firestore';

// ─── Core reward currency ─────────────────────────────────────────────────────
export interface RewardState {
  familyId:       string;
  childId:        string;
  totalPoints:    number;
  checkInStreak:  number;      // consecutive-day streak (NEVER resets)
  longestStreak:  number;
  totalCheckIns:  number;
  petHappiness:   number;      // 0–100
  gardenLevel:    number;      // 0–10 (0 = seeds, 10 = full bloom)
  aquariumLevel:  number;      // 0–10 (0 = empty, 10 = full tank)
  unlockedStickers: string[];  // sticker IDs
  lastCheckInDate:  string | null;  // ISO date YYYY-MM-DD
  updatedAt:        Timestamp | any;
}

// ─── Sticker definitions ──────────────────────────────────────────────────────
export interface Sticker {
  id:          string;
  emoji:       string;
  titleKey:    string;   // i18n key
  milestone:   number;   // check-in count to unlock
  color:       string;   // pastel background
}

export const STICKERS: Sticker[] = [
  { id: 'first_checkin',   emoji: '⭐', titleKey: 'REWARDS.STICKER.FIRST',     milestone: 1,   color: '#FFFDE7' },
  { id: 'five_checkins',   emoji: '🌟', titleKey: 'REWARDS.STICKER.FIVE',      milestone: 5,   color: '#FFF3E0' },
  { id: 'ten_checkins',    emoji: '🏆', titleKey: 'REWARDS.STICKER.TEN',       milestone: 10,  color: '#EDE7FF' },
  { id: 'brave',           emoji: '🦁', titleKey: 'REWARDS.STICKER.BRAVE',     milestone: 3,   color: '#FFF3E0' },
  { id: 'explorer',        emoji: '🔭', titleKey: 'REWARDS.STICKER.EXPLORER',  milestone: 7,   color: '#E0F7FA' },
  { id: 'champion',        emoji: '🎯', titleKey: 'REWARDS.STICKER.CHAMPION',  milestone: 15,  color: '#FFE4EF' },
  { id: 'superstar',       emoji: '🌈', titleKey: 'REWARDS.STICKER.SUPERSTAR', milestone: 25,  color: '#E8F5E9' },
  { id: 'legend',          emoji: '👑', titleKey: 'REWARDS.STICKER.LEGEND',    milestone: 50,  color: '#EDE7FF' },
];

// ─── Garden stages ────────────────────────────────────────────────────────────
export interface GardenStage {
  level:   number;
  emoji:   string;
  label:   string;
  bgColor: string;
}

export const GARDEN_STAGES: GardenStage[] = [
  { level: 0,  emoji: '🌱', label: 'Just planted',     bgColor: '#E8F5E9' },
  { level: 1,  emoji: '🌿', label: 'Sprouting',        bgColor: '#E8F5E9' },
  { level: 2,  emoji: '🌼', label: 'First flower',     bgColor: '#FFFDE7' },
  { level: 3,  emoji: '🌸', label: 'Blossoming',       bgColor: '#FFE4EF' },
  { level: 4,  emoji: '🌺', label: 'In full bloom',    bgColor: '#FFE4EF' },
  { level: 5,  emoji: '🌻', label: 'Sunflower garden', bgColor: '#FFF3E0' },
  { level: 6,  emoji: '🌷', label: 'Tulip meadow',     bgColor: '#FFE4EF' },
  { level: 7,  emoji: '🌳', label: 'Growing tree',     bgColor: '#E8F5E9' },
  { level: 8,  emoji: '🌴', label: 'Tropical garden',  bgColor: '#E0F7FA' },
  { level: 9,  emoji: '🏡', label: 'Garden cottage',   bgColor: '#EDE7FF' },
  { level: 10, emoji: '🌈', label: 'Rainbow garden',   bgColor: '#EDE7FF' },
];

// ─── Aquarium stages ──────────────────────────────────────────────────────────
export interface AquariumStage {
  level:      number;
  fish:       string[];   // emoji fish in the tank
  label:      string;
  waterColor: string;
}

export const AQUARIUM_STAGES: AquariumStage[] = [
  { level: 0,  fish: [],                                   label: 'Empty tank',      waterColor: '#E3F2FD' },
  { level: 1,  fish: ['🐠'],                               label: 'First fish!',     waterColor: '#E3F2FD' },
  { level: 2,  fish: ['🐠','🐟'],                          label: 'Two friends',     waterColor: '#E1F5FE' },
  { level: 3,  fish: ['🐠','🐟','🐡'],                     label: 'Little school',   waterColor: '#E0F7FA' },
  { level: 4,  fish: ['🐠','🐟','🐡','🦀'],                label: 'Crab joined!',    waterColor: '#E0F7FA' },
  { level: 5,  fish: ['🐠','🐟','🐡','🦀','🐙'],           label: 'Octopus arrived', waterColor: '#E8EAF6' },
  { level: 6,  fish: ['🐠','🐟','🐡','🦀','🐙','🦞'],      label: 'Lobster!',        waterColor: '#EDE7FF' },
  { level: 7,  fish: ['🐠','🐟','🐡','🦀','🐙','🦞','🐬'], label: 'Dolphin!',        waterColor: '#E3F2FD' },
  { level: 8,  fish: ['🐠','🐟','🐡','🦀','🐙','🦞','🐬','🦭'], label: 'Seal!',      waterColor: '#E1F5FE' },
  { level: 9,  fish: ['🐠','🐟','🐡','🦀','🐙','🦞','🐬','🦭','🐋'], label: 'Whale!', waterColor: '#E8EAF6' },
  { level: 10, fish: ['🐠','🐟','🐡','🦀','🐙','🦞','🐬','🦭','🐋','🦈'], label: 'Full ocean!', waterColor: '#EDE7FF' },
];

// ─── Point values ─────────────────────────────────────────────────────────────
export const POINTS_PER_CHECKIN    = 10;
export const POINTS_PER_STREAK_DAY = 5;   // bonus for consecutive days
export const PET_HAPPINESS_PER_CHECKIN = 8;
export const PET_HAPPINESS_DECAY   = 2;   // per day without check-in (but never goes negative)

// ─── Garden / Aquarium thresholds ─────────────────────────────────────────────
// check-in count needed to reach each level
export const GARDEN_THRESHOLDS  = [0, 2, 5, 8, 12, 18, 25, 35, 45, 60, 80];
export const AQUARIUM_THRESHOLDS = [0, 1, 4, 8, 13, 20, 28, 38, 50, 65, 85];

export function gardenLevelForCount(count: number): number {
  for (let i = GARDEN_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= GARDEN_THRESHOLDS[i]) return i;
  }
  return 0;
}

export function aquariumLevelForCount(count: number): number {
  for (let i = AQUARIUM_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= AQUARIUM_THRESHOLDS[i]) return i;
  }
  return 0;
}

export function newlyUnlockedStickers(prevCount: number, newCount: number): Sticker[] {
  return STICKERS.filter(
    s => s.milestone > prevCount && s.milestone <= newCount,
  );
}
